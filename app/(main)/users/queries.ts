import prisma from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/admin'

export async function getUsers(excludeUserId: string) {
  const admin = createServiceClient()
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) {
    throw new Error('Failed to load auth users')
  }

  const emailById = new Map(data.users.map((user) => [user.id, user.email ?? '']))

  const profiles = await prisma.profile.findMany({
    where: { deleted: false, id: { not: excludeUserId } },
    orderBy: { createdAt: 'desc' },
  })

  return profiles.map((profile) => ({
    id: profile.id,
    email: emailById.get(profile.id) ?? '',
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    enabled: profile.enabled,
    createdAt: profile.createdAt,
  }))
}

export async function getAssignableUsers() {
  return prisma.profile.findMany({
    where: { deleted: false, enabled: true },
    select: { id: true, fullName: true, avatarUrl: true },
    orderBy: { fullName: 'asc' },
  })
}
