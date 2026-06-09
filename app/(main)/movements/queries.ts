import prisma from '@/lib/prisma'
import type { Enum_MovementType } from '@/app/generated/prisma'
import { projectAccessWhere } from '../tasks/queries'

export type TaskMovement = {
  id: string
  taskId: string | null
  projectId: string
  project: { name: string }
  actorId: string
  actor: { fullName: string | null; avatarUrl: string | null }
  type: Enum_MovementType
  taskTitle: string
  fromColumn: string | null
  toColumn: string | null
  detail: unknown
  createdAt: Date
}

interface GetMovementsOptions {
  userId: string
  isAdmin: boolean
  projectId?: string
  actorId?: string
  type?: Enum_MovementType
  take?: number
  cursor?: string
}

export async function getMovements({
  userId,
  isAdmin,
  projectId,
  actorId,
  type,
  take = 50,
  cursor,
}: GetMovementsOptions): Promise<TaskMovement[]> {
  // Build accessible project ids for access control
  const accessibleProjects = await prisma.project.findMany({
    where: projectAccessWhere(userId, isAdmin),
    select: { id: true },
  })
  const accessibleIds = accessibleProjects.map((p) => p.id)

  const movements = await prisma.taskMovement.findMany({
    where: {
      projectId: projectId
        ? { in: [projectId].filter((id) => accessibleIds.includes(id)) }
        : { in: accessibleIds },
      ...(actorId ? { actorId } : {}),
      ...(type ? { type } : {}),
    },
    include: {
      project: { select: { name: true } },
      actor: { select: { fullName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  return movements.map((m) => ({
    id: m.id,
    taskId: m.taskId,
    projectId: m.projectId,
    project: m.project,
    actorId: m.actorId,
    actor: m.actor,
    type: m.type,
    taskTitle: m.taskTitle,
    fromColumn: m.fromColumn,
    toColumn: m.toColumn,
    detail: m.detail,
    createdAt: m.createdAt,
  }))
}

export async function getMovementFilterOptions(userId: string, isAdmin: boolean) {
  const projects = await prisma.project.findMany({
    where: projectAccessWhere(userId, isAdmin),
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  })

  return { projects }
}
