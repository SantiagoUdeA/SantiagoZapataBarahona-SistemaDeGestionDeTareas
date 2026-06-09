import prisma from '@/lib/prisma'
import { Prisma } from '@/app/generated/prisma'
import type { Enum_MovementType } from '@/app/generated/prisma'

interface LogInput {
  taskId: string | null
  projectId: string
  actorId: string
  type: Enum_MovementType
  taskTitle: string
  fromColumn?: string | null
  toColumn?: string | null
  detail?: Prisma.InputJsonValue
}

export async function logTaskMovement(input: LogInput): Promise<void> {
  try {
    await prisma.taskMovement.create({
      data: {
        taskId: input.taskId,
        projectId: input.projectId,
        actorId: input.actorId,
        type: input.type,
        taskTitle: input.taskTitle,
        fromColumn: input.fromColumn ?? null,
        toColumn: input.toColumn ?? null,
        detail: input.detail ?? Prisma.JsonNull,
      },
    })
  } catch {
    // Audit failure must not break the user mutation
  }
}
