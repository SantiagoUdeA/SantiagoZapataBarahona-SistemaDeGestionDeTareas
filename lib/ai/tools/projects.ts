import { tool } from 'ai'
import { z } from 'zod'
import { getSession } from '@/lib/auth/guard'
import {
  createProject as createProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
  getProjectMembers as getProjectMembersAction,
} from '@/app/(main)/projects/actions'
import { getProjects } from '@/app/(main)/projects/queries'
import { getSelectableProjects } from '@/app/(main)/tasks/queries'

export const listProjects = tool({
  description: 'Lista los proyectos del usuario actual. Admins ven solo sus propios proyectos.',
  inputSchema: z.object({}),
  execute: async () => {
    const session = await getSession()
    if (!session) return { error: 'No autorizado' }
    return getProjects(session.id, session.role === 'ADMIN')
  },
})

export const listSelectableProjects = tool({
  description: 'Lista proyectos donde se pueden crear tareas (para selector de proyecto).',
  inputSchema: z.object({}),
  execute: async () => {
    const session = await getSession()
    if (!session) return { error: 'No autorizado' }
    return getSelectableProjects(session.id, session.role === 'ADMIN')
  },
})

export const createProject = tool({
  description: 'Crea un nuevo proyecto. Solo admins.',
  inputSchema: z.object({
    name: z.string().min(1).max(200),
  }),
  execute: async ({ name }) => {
    return createProjectAction(name)
  },
})

export const updateProject = tool({
  description: 'Actualiza el nombre de un proyecto. Solo el creador puede actualizar.',
  inputSchema: z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200),
  }),
  execute: async ({ id, name }) => {
    return updateProjectAction(id, name)
  },
})

export const deleteProject = tool({
  description: 'Elimina un proyecto. Solo el creador puede eliminar. DESTRUCTIVO: confirmar antes de ejecutar.',
  inputSchema: z.object({
    id: z.string().uuid(),
  }),
  execute: async ({ id }) => {
    return deleteProjectAction(id)
  },
})

export const getProjectMembers = tool({
  description: 'Lista miembros de un proyecto y usuarios asignables. Solo admins.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
  }),
  execute: async ({ projectId }) => {
    return getProjectMembersAction(projectId)
  },
})
