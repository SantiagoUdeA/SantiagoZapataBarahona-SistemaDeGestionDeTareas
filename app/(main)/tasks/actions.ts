'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/guard'
import prisma from '@/lib/prisma'
import { logTaskMovement } from '@/lib/audit'

// Helper: verify user has access to a project
// ADMIN → must own project; USER → must be member
async function hasProjectAccess(projectId: string, userId: string, isAdmin: boolean) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(isAdmin
        ? { createdBy: userId }
        : { members: { some: { profileId: userId } } }),
    },
    select: { id: true },
  })
  return !!project
}

// Helper: verify user is project owner or ADMIN (for column CRUD)
async function hasOwnerAccess(projectId: string, userId: string, isAdmin: boolean) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, createdBy: userId },
    select: { id: true },
  })
  return isAdmin || !!project
}

// Get all assignable profiles for a project
export async function getAssignableProfiles(projectId: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  const isAdmin = session.role === 'ADMIN'
  const allowed = await hasProjectAccess(projectId, session.id, isAdmin)
  if (!allowed) return { error: 'No autorizado' }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { profile: { select: { id: true, fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return { profiles: members.map((m) => m.profile) }
}

// Create a new task
// If no columnId given, uses the first column (lowest position) in the project
export async function createTask(
  projectId: string,
  title: string,
  assigneeId: string,
  description: string = '',
  columnId?: string,
) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  if (!title.trim() || !assigneeId) {
    return { error: 'El título y el responsable son requeridos' }
  }

  try {
    const isAdmin = session.role === 'ADMIN'
    const allowed = await hasProjectAccess(projectId, session.id, isAdmin)
    if (!allowed) return { error: 'No autorizado' }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_profileId: { projectId, profileId: assigneeId } },
    })
    if (!member) return { error: 'El responsable elegido no pertenece al proyecto' }

    // Resolve column
    let resolvedColumnId = columnId
    if (!resolvedColumnId) {
      const firstColumn = await prisma.boardColumn.findFirst({
        where: { projectId },
        orderBy: { position: 'asc' },
        select: { id: true },
      })
      if (!firstColumn) return { error: 'El proyecto no tiene columnas configuradas' }
      resolvedColumnId = firstColumn.id
    }

    // Position = count of tasks already in that column
    const taskCount = await prisma.task.count({ where: { columnId: resolvedColumnId } })

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        projectId,
        assigneeId,
        createdById: session.id,
        columnId: resolvedColumnId,
        position: taskCount,
      },
      select: { id: true, title: true, column: { select: { name: true } } },
    })

    await logTaskMovement({
      taskId: task.id,
      projectId,
      actorId: session.id,
      type: 'CREATED',
      taskTitle: task.title,
      toColumn: task.column.name,
    })

    revalidatePath('/tasks')
    return { id: task.id }
  } catch {
    return { error: 'Error al crear la tarea' }
  }
}

// Update task title and description
// Can be edited by: assignee, project owner, or ADMIN
export async function updateTask(taskId: string, title: string, description: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  if (!title.trim()) return { error: 'El título es requerido' }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, assigneeId: true, projectId: true, project: { select: { createdBy: true } } },
    })

    if (!task) return { error: 'Tarea no encontrada' }

    const isAdmin = session.role === 'ADMIN'
    const isAssignee = task.assigneeId === session.id
    const isOwner = task.project.createdBy === session.id
    if (!isAssignee && !isOwner && !isAdmin) return { error: 'No autorizado' }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { title: title.trim(), description: description.trim() || null },
    })

    await logTaskMovement({
      taskId: task.id,
      projectId: task.projectId,
      actorId: session.id,
      type: 'UPDATED',
      taskTitle: title.trim(),
    })

    revalidatePath('/tasks')
    return { id: updated.id }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') return { error: 'Tarea no encontrada' }
    return { error: 'Error al actualizar la tarea' }
  }
}

// Move a task to a different column at a given position
// Handles completedAt/completedById based on destination column isDone flag
export async function moveTask(taskId: string, toColumnId: string, toPosition: number) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        projectId: true,
        assigneeId: true,
        column: { select: { name: true } },
        project: { select: { createdBy: true } },
      },
    })
    if (!task) return { error: 'Tarea no encontrada' }

    const isAdmin = session.role === 'ADMIN'
    const isAssignee = task.assigneeId === session.id
    const isOwner = task.project.createdBy === session.id
    if (!isAssignee && !isOwner && !isAdmin) return { error: 'No autorizado' }

    const toColumn = await prisma.boardColumn.findUnique({
      where: { id: toColumnId },
      select: { id: true, name: true, isDone: true, projectId: true },
    })
    if (!toColumn) return { error: 'Columna destino no encontrada' }
    if (toColumn.projectId !== task.projectId) return { error: 'La columna no pertenece al proyecto' }

    const fromColumnName = task.column.name

    await prisma.$transaction(async (tx) => {
      // Shift tasks in destination column to make room
      await tx.task.updateMany({
        where: { columnId: toColumnId, position: { gte: toPosition } },
        data: { position: { increment: 1 } },
      })

      // Move task
      await tx.task.update({
        where: { id: taskId },
        data: {
          columnId: toColumnId,
          position: toPosition,
          ...(toColumn.isDone
            ? { completedAt: new Date(), completedById: session.id }
            : { completedAt: null, completedById: null }),
        },
      })
    })

    await logTaskMovement({
      taskId: task.id,
      projectId: task.projectId,
      actorId: session.id,
      type: 'COLUMN_CHANGED',
      taskTitle: task.title,
      fromColumn: fromColumnName,
      toColumn: toColumn.name,
    })

    revalidatePath('/tasks')
    return { id: taskId }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') return { error: 'Tarea no encontrada' }
    return { error: 'Error al mover la tarea' }
  }
}

// Reorder a task within its current column
export async function reorderTask(taskId: string, toPosition: number) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        projectId: true,
        columnId: true,
        position: true,
        assigneeId: true,
        project: { select: { createdBy: true } },
      },
    })
    if (!task) return { error: 'Tarea no encontrada' }

    const isAdmin = session.role === 'ADMIN'
    const isAssignee = task.assigneeId === session.id
    const isOwner = task.project.createdBy === session.id
    if (!isAssignee && !isOwner && !isAdmin) return { error: 'No autorizado' }

    const fromPosition = task.position

    // Fetch all tasks in column ordered by position
    const columnTasks = await prisma.task.findMany({
      where: { columnId: task.columnId },
      orderBy: { position: 'asc' },
      select: { id: true },
    })

    // Reorder in JS: remove from current, splice at toPosition
    const ids = columnTasks.map((t) => t.id)
    const fromIdx = ids.indexOf(taskId)
    if (fromIdx === -1) return { error: 'Tarea no encontrada en la columna' }

    ids.splice(fromIdx, 1)
    ids.splice(toPosition, 0, taskId)

    await prisma.$transaction(
      ids.map((id, idx) => prisma.task.update({ where: { id }, data: { position: idx } }))
    )

    await logTaskMovement({
      taskId: task.id,
      projectId: task.projectId,
      actorId: session.id,
      type: 'REORDERED',
      taskTitle: task.title,
      detail: { fromPosition, toPosition },
    })

    revalidatePath('/tasks')
    return { id: taskId }
  } catch {
    return { error: 'Error al reordenar la tarea' }
  }
}

// Create a new column in a project (owner or ADMIN only)
export async function createColumn(projectId: string, name: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  if (!name.trim()) return { error: 'El nombre es requerido' }

  try {
    const isAdmin = session.role === 'ADMIN'
    const allowed = await hasOwnerAccess(projectId, session.id, isAdmin)
    if (!allowed) return { error: 'No autorizado' }

    const position = await prisma.boardColumn.count({ where: { projectId } })

    const column = await prisma.boardColumn.create({
      data: { projectId, name: name.trim(), position },
    })

    revalidatePath('/tasks')
    return { id: column.id }
  } catch {
    return { error: 'Error al crear la columna' }
  }
}

// Rename a column (owner or ADMIN only)
export async function renameColumn(columnId: string, name: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  if (!name.trim()) return { error: 'El nombre es requerido' }

  try {
    const column = await prisma.boardColumn.findUnique({
      where: { id: columnId },
      select: { id: true, projectId: true },
    })
    if (!column) return { error: 'Columna no encontrada' }

    const isAdmin = session.role === 'ADMIN'
    const allowed = await hasOwnerAccess(column.projectId, session.id, isAdmin)
    if (!allowed) return { error: 'No autorizado' }

    await prisma.boardColumn.update({ where: { id: columnId }, data: { name: name.trim() } })

    revalidatePath('/tasks')
    return { id: columnId }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') return { error: 'Columna no encontrada' }
    return { error: 'Error al renombrar la columna' }
  }
}

// Delete a column — only if it has no tasks
export async function deleteColumn(columnId: string) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  try {
    const column = await prisma.boardColumn.findUnique({
      where: { id: columnId },
      select: { id: true, projectId: true, _count: { select: { tasks: true } } },
    })
    if (!column) return { error: 'Columna no encontrada' }

    if (column._count.tasks > 0) {
      return { error: 'Mueve las tareas antes de eliminar esta columna' }
    }

    const isAdmin = session.role === 'ADMIN'
    const allowed = await hasOwnerAccess(column.projectId, session.id, isAdmin)
    if (!allowed) return { error: 'No autorizado' }

    await prisma.boardColumn.delete({ where: { id: columnId } })

    revalidatePath('/tasks')
    return { id: columnId }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') return { error: 'Columna no encontrada' }
    return { error: 'Error al eliminar la columna' }
  }
}

// Reorder columns within a project (owner or ADMIN only)
export async function reorderColumn(columnId: string, toPosition: number) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  try {
    const column = await prisma.boardColumn.findUnique({
      where: { id: columnId },
      select: { id: true, projectId: true },
    })
    if (!column) return { error: 'Columna no encontrada' }

    const isAdmin = session.role === 'ADMIN'
    const allowed = await hasOwnerAccess(column.projectId, session.id, isAdmin)
    if (!allowed) return { error: 'No autorizado' }

    const allColumns = await prisma.boardColumn.findMany({
      where: { projectId: column.projectId },
      orderBy: { position: 'asc' },
      select: { id: true },
    })

    const ids = allColumns.map((c) => c.id)
    const fromIdx = ids.indexOf(columnId)
    if (fromIdx === -1) return { error: 'Columna no encontrada en el proyecto' }

    ids.splice(fromIdx, 1)
    ids.splice(toPosition, 0, columnId)

    await prisma.$transaction(
      ids.map((id, idx) => prisma.boardColumn.update({ where: { id }, data: { position: idx } }))
    )

    revalidatePath('/tasks')
    return { id: columnId }
  } catch {
    return { error: 'Error al reordenar la columna' }
  }
}

// Set isDone flag on a column; syncs completedAt on all tasks in the column
export async function setColumnDone(columnId: string, isDone: boolean) {
  const session = await getSession()
  if (!session) return { error: 'No autorizado' }

  try {
    const column = await prisma.boardColumn.findUnique({
      where: { id: columnId },
      select: { id: true, projectId: true },
    })
    if (!column) return { error: 'Columna no encontrada' }

    const isAdmin = session.role === 'ADMIN'
    const allowed = await hasOwnerAccess(column.projectId, session.id, isAdmin)
    if (!allowed) return { error: 'No autorizado' }

    await prisma.boardColumn.update({ where: { id: columnId }, data: { isDone } })

    if (isDone) {
      await prisma.task.updateMany({
        where: { columnId },
        data: { completedAt: new Date(), completedById: session.id },
      })
    } else {
      await prisma.task.updateMany({
        where: { columnId },
        data: { completedAt: null, completedById: null },
      })
    }

    revalidatePath('/tasks')
    return { id: columnId }
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') return { error: 'Columna no encontrada' }
    return { error: 'Error al actualizar la columna' }
  }
}
