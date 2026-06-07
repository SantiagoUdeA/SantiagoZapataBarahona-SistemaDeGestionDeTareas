import { tool } from 'ai'
import { z } from 'zod'
import { requireAdminSession } from '@/lib/auth/guard'
import {
  createUser as createUserAction,
  updateUserRole as updateUserRoleAction,
  deleteUser as deleteUserAction,
  toggleUserEnabled as toggleUserEnabledAction,
  assignUserToProject as assignUserToProjectAction,
  removeUserFromProject as removeUserFromProjectAction,
} from '@/app/(main)/users/actions'
import { getUsers, getAssignableUsers } from '@/app/(main)/users/queries'

export const listUsers = tool({
  description: 'Lista todos los usuarios del sistema. Solo para admins.',
  inputSchema: z.object({}),
  execute: async () => {
    const guard = await requireAdminSession()
    if ('error' in guard) return { error: guard.error }
    return getUsers(guard.session.id)
  },
})

export const listAssignableUsers = tool({
  description: 'Lista usuarios asignables a tareas (enabled y no deleted). Solo para admins.',
  inputSchema: z.object({}),
  execute: async () => {
    const guard = await requireAdminSession()
    if ('error' in guard) return { error: guard.error }
    return getAssignableUsers()
  },
})

export const createUser = tool({
  description: 'Crea un nuevo usuario. Solo admins.',
  inputSchema: z.object({
    email: z.string().email(),
    fullName: z.string().optional(),
    role: z.enum(['ADMIN', 'USER']),
  }),
  execute: async ({ email, fullName, role }) => {
    return createUserAction({ email, fullName, role })
  },
})

export const updateUserRole = tool({
  description: 'Cambia el rol de un usuario. Solo admins. DESTRUCTIVO: confirmar antes de ejecutar.',
  inputSchema: z.object({
    userId: z.string().uuid(),
    role: z.enum(['ADMIN', 'USER']),
  }),
  execute: async ({ userId, role }) => {
    return updateUserRoleAction(userId, role)
  },
})

export const toggleUserEnabled = tool({
  description: 'Activa o desactiva un usuario. Solo admins.',
  inputSchema: z.object({
    userId: z.string().uuid(),
    enabled: z.boolean(),
  }),
  execute: async ({ userId, enabled }) => {
    return toggleUserEnabledAction(userId, enabled)
  },
})

export const deleteUser = tool({
  description: 'Elimina un usuario (soft delete, lo bans). Solo admins. DESTRUCTIVO: confirmar antes de ejecutar.',
  inputSchema: z.object({
    userId: z.string().uuid(),
  }),
  execute: async ({ userId }) => {
    return deleteUserAction(userId)
  },
})

export const assignUserToProject = tool({
  description: 'Asigna un usuario a un proyecto. Solo admins.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
    profileId: z.string().uuid(),
  }),
  execute: async ({ projectId, profileId }) => {
    return assignUserToProjectAction(projectId, profileId)
  },
})

export const removeUserFromProject = tool({
  description: 'Quita un usuario de un proyecto. Solo admins. DESTRUCTIVO: confirmar antes de ejecutar.',
  inputSchema: z.object({
    projectId: z.string().uuid(),
    profileId: z.string().uuid(),
  }),
  execute: async ({ projectId, profileId }) => {
    return removeUserFromProjectAction(projectId, profileId)
  },
})
