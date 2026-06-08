// Server actions for task management mutations
// All actions verify authorization and project access before modifying tasks

'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/guard'
import prisma from '@/lib/prisma'

// Allowed task status values
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const
type TaskStatus = (typeof TASK_STATUSES)[number]

// Helper: Verify user has access to a project
// Ensures users can only work with projects they own or are members of
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

// Get all assignable profiles for a project
// Returns users who are project members (can be assigned tasks)
export async function getAssignableProfiles(projectId: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'No autorizado' }
  }

  const isAdmin = session.role === 'ADMIN'
  const allowed = await hasProjectAccess(projectId, session.id, isAdmin)
  if (!allowed) {
    return { error: 'No autorizado' }
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { profile: { select: { id: true, fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return { profiles: members.map((m) => m.profile) }
}

// Create a new task
// Assignee must be a project member
// Returns { id } on success or { error } on failure
export async function createTask(projectId: string, title: string, assigneeId: string, description: string = '') {
  const session = await getSession()
  if (!session) {
    return { error: 'No autorizado' }
  }

  if (!title.trim() || !assigneeId) {
    return { error: 'El título y el responsable son requeridos' }
  }

  try {
    const isAdmin = session.role === 'ADMIN'
    const allowed = await hasProjectAccess(projectId, session.id, isAdmin)
    if (!allowed) {
      return { error: 'No autorizado' }
    }

    // Verify assignee is a project member
    const member = await prisma.projectMember.findUnique({
      where: { projectId_profileId: { projectId, profileId: assigneeId } },
    })
    if (!member) {
      return { error: 'El responsable elegido no pertenece al proyecto' }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description.trim() || null,
        projectId,
        assigneeId,
        createdById: session.id,
      },
    })
    revalidatePath('/tasks')
    return { id: task.id }
  } catch (err) {
    return { error: 'Error al crear la tarea' }
  }
}

// Update task title and description
// Can be edited by: assignee, project owner, or ADMIN
export async function updateTask(taskId: string, title: string, description: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'No autorizado' }
  }

  if (!title.trim()) {
    return { error: 'El título es requerido' }
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assigneeId: true, project: { select: { createdBy: true } } },
    })

    if (!task) {
      return { error: 'Tarea no encontrada' }
    }

    // Access control: assignee, project owner, or ADMIN can edit
    const isAdmin = session.role === 'ADMIN'
    const isAssignee = task.assigneeId === session.id
    const isOwner = task.project.createdBy === session.id
    if (!isAssignee && !isOwner && !isAdmin) {
      return { error: 'No autorizado' }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { title: title.trim(), description: description.trim() || null },
    })
    revalidatePath('/tasks')
    return { id: updated.id }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'Tarea no encontrada' }
    }
    return { error: 'Error al actualizar la tarea' }
  }
}

// Update task status with completion tracking
// When marked COMPLETED: sets completedAt timestamp and completedById (who completed it)
// When marking as non-COMPLETED: clears completion info
// Can be updated by: assignee, project owner, or ADMIN
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const session = await getSession()
  if (!session) {
    return { error: 'No autorizado' }
  }

  if (!TASK_STATUSES.includes(status)) {
    return { error: 'Estado inválido' }
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assigneeId: true, project: { select: { createdBy: true } } },
    })

    if (!task) {
      return { error: 'Tarea no encontrada' }
    }

    // Access control: assignee, project owner, or ADMIN can change status
    const isAdmin = session.role === 'ADMIN'
    const isAssignee = task.assigneeId === session.id
    const isOwner = task.project.createdBy === session.id
    if (!isAssignee && !isOwner && !isAdmin) {
      return { error: 'No autorizado' }
    }

    // Set completion timestamp when marking COMPLETED, clear if unmarking
    const updated = await prisma.task.update({
      where: { id: taskId },
      data:
        status === 'COMPLETED'
          ? { status, completedAt: new Date(), completedById: session.id }
          : { status, completedAt: null, completedById: null },
    })
    revalidatePath('/tasks')
    return { id: updated.id }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'Tarea no encontrada' }
    }
    return { error: 'Error al actualizar la tarea' }
  }
}
