// Server actions for project management mutations
// All actions verify authorization before modifying data and revalidate cache on success

'use server'

import { revalidatePath } from 'next/cache'
import { getSession, requireAdminSession } from '@/lib/auth/guard'
import prisma from '@/lib/prisma'

// Create a new project (ADMIN only)
// Automatically adds the creator as the first project member
// Returns { id } on success or { error } on failure
export async function createProject(name: string) {
  const guard = await requireAdminSession()
  if ('error' in guard) return { error: guard.error }
  const session = guard.session

  try {
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        createdBy: session.id,
        members: {
          create: { profileId: session.id },  // Creator is automatically a member
        },
      },
    })
    revalidatePath('/projects')  // Refresh the projects page
    return { id: project.id }
  } catch (err) {
    return { error: 'Error al crear el proyecto' }
  }
}

// Update project name
// Only the project creator can update (checks createdBy === session.id)
// Returns { id } on success or { error } on failure
export async function updateProject(id: string, name: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project || project.createdBy !== session.id) {
      return { error: 'No autorizado' }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { name: name.trim() },
    })
    revalidatePath('/projects')
    return { id: updated.id }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'Proyecto no encontrado' }
    }
    return { error: 'Error al actualizar el proyecto' }
  }
}

// Fetch project members and assignable users
// Returns current members and available profiles not yet added to the project
// Note: Only ADMIN can manage project members
export async function getProjectMembers(projectId: string) {
  const guard = await requireAdminSession()
  if ('error' in guard) return { error: guard.error }
  const session = guard.session

  // Fetch both members and all available users in parallel
  const [members, assignable] = await Promise.all([
    prisma.projectMember.findMany({
      where: { projectId },
      include: { profile: { select: { id: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    // All non-deleted, enabled profiles except current user
    prisma.profile.findMany({
      where: { deleted: false, enabled: true, id: { not: session.id } },
      select: { id: true, fullName: true, avatarUrl: true },
      orderBy: { fullName: 'asc' },
    }),
  ])

  // Build set of existing member IDs for filtering
  const memberIds = new Set(members.map((m) => m.profileId))

  return {
    members: members.map((m) => m.profile),
    assignable: assignable.filter((profile) => !memberIds.has(profile.id)),  // Exclude already-added members
  }
}

// Delete a project (ADMIN only)
// Only the project creator can delete it
// Cascade delete removes all associated tasks automatically (via schema constraint)
// Returns { success: true } or { error } on failure
export async function deleteProject(id: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project || project.createdBy !== session.id) {
      return { error: 'No autorizado' }
    }

    await prisma.project.delete({ where: { id } })
    revalidatePath('/projects')
    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'Proyecto no encontrado' }
    }
    return { error: 'Error al eliminar el proyecto' }
  }
}
