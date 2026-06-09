// Server functions for fetching projects
// These queries implement role-based access control:
// - ADMIN: can see all their created projects
// - USER: can only see projects they're members of

import prisma from '@/lib/prisma'

// Fetches projects visible to the current user
// Filters by role: ADMIN sees created projects, USER sees projects where they're members
// Includes owner info, task statuses, and calculates overall project progress
export async function getProjects(userId: string, isAdmin: boolean) {
  const projects = await prisma.project.findMany({
    where: isAdmin
      ? { createdBy: userId }  // ADMIN: only their own created projects
      : { members: { some: { profileId: userId } } },  // USER: projects they're member of
    include: {
      owner: { select: { id: true, fullName: true, avatarUrl: true } },
      tasks: { select: { completedAt: true } },  // Used for progress calculation
    },
    orderBy: { createdAt: 'desc' },
  })

  // Map projects to include calculated progress percentage
  return projects.map((project) => {
    const progress = calculateProgress(project.tasks)
    return {
      id: project.id,
      name: project.name,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      owner: project.owner,
      progress,  // Percentage of completed tasks
    }
  })
}

// Helper: Calculate completion percentage
// Returns 0 if no tasks, otherwise (completed / total) * 100
function calculateProgress(tasks: Array<{ completedAt: Date | null }>) {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.completedAt !== null).length
  return Math.round((completed / tasks.length) * 100)
}
