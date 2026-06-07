import { tool } from 'ai'
import { z } from 'zod'
import { getSession } from '@/lib/auth/guard'
import {
  createTask as createTaskAction,
  updateTaskStatus as updateTaskStatusAction,
  getAssignableProfiles as getAssignableProfilesAction,
} from '@/app/(main)/tasks/actions'
import { getTasks, getProgressOverTime as getProgressOverTimeQuery } from '@/app/(main)/tasks/queries'

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const

export const listTasks = tool({
  description: 'Lista las tareas de un proyecto. Solo usuarios con acceso al proyecto.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
  }),
  execute: async ({ projectId }) => {
    const session = await getSession()
    if (!session) return { error: 'No autorizado' }
    return getTasks(projectId, session.id, session.role === 'ADMIN')
  },
})

export const getProgressOverTime = tool({
  description: 'Devuelve el progreso acumulado de tareas completadas por dia en un proyecto.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
  }),
  execute: async ({ projectId }) => {
    const session = await getSession()
    if (!session) return { error: 'No autorizado' }
    return getProgressOverTimeQuery(projectId)
  },
})

export const createTask = tool({
  description: 'Crea una tarea en un proyecto. El responsable debe ser miembro del proyecto.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
    title: z.string().min(1).max(500),
    assigneeId: z.string().uuid(),
  }),
  execute: async ({ projectId, title, assigneeId }) => {
    return createTaskAction(projectId, title, assigneeId)
  },
})

export const updateTaskStatus = tool({
  description: 'Cambia el estado de una tarea. El usuario debe ser assignee, owner del proyecto o admin.',
  inputSchema: z.object({
    taskId: z.string().uuid(),
    status: z.enum(TASK_STATUSES),
  }),
  execute: async ({ taskId, status }) => {
    return updateTaskStatusAction(taskId, status)
  },
})

export const getAssignableProfiles = tool({
  description: 'Lista miembros de un proyecto disponibles para asignar como responsables de tareas.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
  }),
  execute: async ({ projectId }) => {
    return getAssignableProfilesAction(projectId)
  },
})
