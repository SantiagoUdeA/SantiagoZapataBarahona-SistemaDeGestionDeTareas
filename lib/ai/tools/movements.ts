// AI tool for querying the task movement audit log

import { tool } from 'ai'
import { z } from 'zod'
import { getSession } from '@/lib/auth/guard'
import { getMovements, getMovementFilterOptions } from '@/app/(main)/movements/queries'
import type { Enum_MovementType } from '@/app/generated/prisma'

export const listMovements = tool({
  description:
    'Lista los movimientos registrados en el historial de auditoría de tareas. Permite filtrar por proyecto y tipo de movimiento. Solo devuelve movimientos de proyectos a los que el usuario tiene acceso.',
  inputSchema: z.object({
    projectId: z.string().uuid().optional(),
    type: z
      .enum(['CREATED', 'UPDATED', 'COLUMN_CHANGED', 'REORDERED', 'DELETED'])
      .optional(),
    take: z.number().int().min(1).max(100).default(50).optional(),
  }),
  execute: async ({ projectId, type, take }) => {
    const session = await getSession()
    if (!session) return { error: 'No autorizado' }

    const isAdmin = session.role === 'ADMIN'

    const movements = await getMovements({
      userId: session.id,
      isAdmin,
      projectId,
      type: type as Enum_MovementType | undefined,
      take: take ?? 50,
    })

    return { movements }
  },
})

export const listMovementProjects = tool({
  description:
    'Lista los proyectos disponibles para filtrar en el historial de movimientos. Solo proyectos a los que el usuario tiene acceso.',
  inputSchema: z.object({}),
  execute: async () => {
    const session = await getSession()
    if (!session) return { error: 'No autorizado' }

    const isAdmin = session.role === 'ADMIN'
    const { projects } = await getMovementFilterOptions(session.id, isAdmin)

    return { projects }
  },
})
