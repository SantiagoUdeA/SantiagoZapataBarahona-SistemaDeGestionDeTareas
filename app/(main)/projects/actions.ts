'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/guard'
import prisma from '@/lib/prisma'

export async function createProject(name: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        createdBy: session.id,
      },
    })
    revalidatePath('/projects')
    return { id: project.id }
  } catch (err) {
    return { error: 'Failed to create project' }
  }
}

export async function updateProject(id: string, name: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project || project.createdBy !== session.id) {
      return { error: 'Unauthorized' }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { name: name.trim() },
    })
    revalidatePath('/projects')
    return { id: updated.id }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'Project not found' }
    }
    return { error: 'Failed to update project' }
  }
}

export async function deleteProject(id: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project || project.createdBy !== session.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.project.delete({ where: { id } })
    revalidatePath('/projects')
    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2025') {
      return { error: 'Project not found' }
    }
    return { error: 'Failed to delete project' }
  }
}
