'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/guard'
import prisma from '@/lib/prisma'

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const
type TaskStatus = (typeof TASK_STATUSES)[number]

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

    const isAdmin = session.role === 'ADMIN'
    const isAssignee = task.assigneeId === session.id
    const isOwner = task.project.createdBy === session.id
    if (!isAssignee && !isOwner && !isAdmin) {
      return { error: 'No autorizado' }
    }

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
