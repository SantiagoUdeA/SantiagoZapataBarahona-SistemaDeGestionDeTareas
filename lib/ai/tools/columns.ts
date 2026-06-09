// AI tools for kanban column management and task reordering
// All mutations go through server actions in app/(main)/tasks/actions.ts

import { tool } from 'ai'
import { z } from 'zod'

import {
  createColumn as createColumnAction,
  renameColumn as renameColumnAction,
  deleteColumn as deleteColumnAction,
  reorderColumn as reorderColumnAction,
  setColumnDone as setColumnDoneAction,
  reorderTask as reorderTaskAction,
} from '@/app/(main)/tasks/actions'

export const createColumn = tool({
  description:
    'Crea una nueva columna en el tablero kanban de un proyecto. Solo el propietario del proyecto o un ADMIN pueden hacerlo.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
    name: z.string().min(1).max(100),
  }),
  execute: async ({ projectId, name }) => {
    return createColumnAction(projectId, name)
  },
})

export const renameColumn = tool({
  description: 'Renombra una columna del kanban. Solo el propietario o ADMIN.',
  inputSchema: z.object({
    columnId: z.string().uuid(),
    name: z.string().min(1).max(100),
  }),
  execute: async ({ columnId, name }) => {
    return renameColumnAction(columnId, name)
  },
})

export const deleteColumn = tool({
  description:
    'Elimina una columna del kanban solo si está vacía (sin tareas). Solo el propietario o ADMIN.',
  inputSchema: z.object({
    columnId: z.string().uuid(),
  }),
  execute: async ({ columnId }) => {
    return deleteColumnAction(columnId)
  },
})

export const reorderColumn = tool({
  description:
    'Reordena una columna dentro del tablero kanban moviéndola a una nueva posición (0-based). Solo propietario o ADMIN.',
  inputSchema: z.object({
    columnId: z.string().uuid(),
    toPosition: z.number().int().min(0),
  }),
  execute: async ({ columnId, toPosition }) => {
    return reorderColumnAction(columnId, toPosition)
  },
})

export const setColumnDone = tool({
  description:
    'Marca o desmarca una columna como "columna de completado". Cuando se marca, todas las tareas en esa columna se consideran completadas. Solo propietario o ADMIN.',
  inputSchema: z.object({
    columnId: z.string().uuid(),
    isDone: z.boolean(),
  }),
  execute: async ({ columnId, isDone }) => {
    return setColumnDoneAction(columnId, isDone)
  },
})

export const reorderTask = tool({
  description:
    'Reordena una tarea dentro de su columna actual moviéndola a una nueva posición (0-based). Puede ser usado por el responsable, el propietario del proyecto o un ADMIN.',
  inputSchema: z.object({
    taskId: z.string().uuid(),
    toPosition: z.number().int().min(0),
  }),
  execute: async ({ taskId, toPosition }) => {
    return reorderTaskAction(taskId, toPosition)
  },
})
