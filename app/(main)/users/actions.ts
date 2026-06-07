'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/admin'
import prisma from '@/lib/prisma'
import { UserCreateSchema, RoleUpdateSchema } from '@/lib/api/validation'

const BANNED_DURATION = '876600h'

async function requireAdmin() {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' as const }
  }
  if (session.role !== 'ADMIN') {
    return { error: 'Forbidden' as const }
  }
  return { session }
}

export async function createUser(input: { email: string; fullName?: string; role: 'ADMIN' | 'USER' }) {
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  const parsed = UserCreateSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Invalid data', details: parsed.error.flatten() }
  }
  const { email, fullName, role } = parsed.data

  const admin = createServiceClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: email,
    email_confirm: true,
    user_metadata: { must_change_password: true },
  })

  if (error || !data.user) {
    if (error?.code === 'email_exists' || error?.status === 422) {
      return { error: 'Email already exists' }
    }
    return { error: 'Failed to create user' }
  }

  try {
    const profile = await prisma.profile.create({
      data: {
        id: data.user.id,
        fullName: fullName ?? null,
        role,
      },
    })
    revalidatePath('/users')
    return { id: profile.id }
  } catch {
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: 'Failed to create user' }
  }
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'USER') {
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  const parsed = RoleUpdateSchema.safeParse({ role })
  if (!parsed.success) {
    return { error: 'Invalid data' }
  }

  try {
    const profile = await prisma.profile.update({
      where: { id: userId },
      data: { role: parsed.data.role },
    })
    revalidatePath('/users')
    return { id: profile.id }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'User not found' }
    }
    return { error: 'Failed to update role' }
  }
}

export async function deleteUser(userId: string) {
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  try {
    await prisma.profile.update({ where: { id: userId }, data: { deleted: true } })
    const admin = createServiceClient()
    await admin.auth.admin.updateUserById(userId, { ban_duration: BANNED_DURATION })
    revalidatePath('/users')
    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'User not found' }
    }
    return { error: 'Failed to delete user' }
  }
}

export async function toggleUserEnabled(userId: string, enabled: boolean) {
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  try {
    await prisma.profile.update({ where: { id: userId }, data: { enabled } })
    const admin = createServiceClient()
    await admin.auth.admin.updateUserById(userId, {
      ban_duration: enabled ? 'none' : BANNED_DURATION,
    })
    revalidatePath('/users')
    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'User not found' }
    }
    return { error: 'Failed to update user' }
  }
}

export async function assignUserToProject(projectId: string, profileId: string) {
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  const [project, profile] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.profile.findUnique({ where: { id: profileId } }),
  ])
  if (!project || !profile) {
    return { error: 'Not found' }
  }

  try {
    await prisma.projectMember.create({ data: { projectId, profileId } })
    revalidatePath('/projects')
    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2002') {
      return { error: 'User already assigned to this project' }
    }
    return { error: 'Failed to assign user' }
  }
}

export async function removeUserFromProject(projectId: string, profileId: string) {
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  try {
    await prisma.projectMember.delete({
      where: { projectId_profileId: { projectId, profileId } },
    })
    revalidatePath('/projects')
    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'Assignment not found' }
    }
    return { error: 'Failed to remove user' }
  }
}
