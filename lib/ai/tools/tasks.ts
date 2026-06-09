// NOTE: All task mutations go through server actions in app/(main)/tasks/actions.ts.
// Audit logging is handled inside those actions — do NOT call prisma.task directly from here.

import { tool } from 'ai'
import { z } from 'zod'
import { getSession } from '@/lib/auth/guard'
import {
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  moveTask as moveTaskAction,
  getAssignableProfiles as getAssignableProfilesAction,
} from '@/app/(main)/tasks/actions'
import {
  getTasks,
  getBoardColumns,
  getProgressOverTime as getProgressOverTimeQuery,
} from '@/app/(main)/tasks/queries'

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

export const listColumns = tool({
  description: 'Lista las columnas del kanban de un proyecto con conteo de tareas.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
  }),
  execute: async ({ projectId }) => {
    return getBoardColumns(projectId)
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
    description: z.string().optional(),
    columnId: z.string().uuid().optional(),
  }),
  execute: async ({ projectId, title, assigneeId, description, columnId }) => {
    return createTaskAction(projectId, title, assigneeId, description ?? '', columnId)
  },
})

export const updateTask = tool({
  description:
    'Edita el título y la descripción de una tarea. El usuario debe ser assignee, owner del proyecto o admin.',
  inputSchema: z.object({
    taskId: z.string().uuid(),
    title: z.string().min(1).max(500),
    description: z.string(),
  }),
  execute: async ({ taskId, title, description }) => {
    return updateTaskAction(taskId, title, description)
  },
})

export const moveTaskToColumn = tool({
  description:
    'Mueve una tarea a otra columna del kanban. Llama a listColumns primero para obtener los IDs disponibles. La tarea se agrega al final de la columna destino.',
  inputSchema: z.object({
    taskId: z.string().uuid(),
    columnId: z.string().uuid(),
  }),
  execute: async ({ taskId, columnId }) => {
    // 9999 appends to end — moveTask shifts existing tasks and places this one last
    return moveTaskAction(taskId, columnId, 9999)
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
