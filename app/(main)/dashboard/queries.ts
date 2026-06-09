import prisma from '@/lib/prisma'

export type DashboardMetrics = {
  activeProjects: number
  inProgressTasks: number
  completedLast30d: number
}

export async function getDashboardMetrics(
  userId: string,
  isAdmin: boolean
): Promise<DashboardMetrics> {
  const projectScope = isAdmin
    ? { createdBy: userId }
    : { members: { some: { profileId: userId } } }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [activeProjects, inProgressTasks, completedLast30d] = await Promise.all([
    prisma.project.count({ where: projectScope }),
    prisma.task.count({
      where: { project: projectScope, completedAt: null },
    }),
    prisma.task.count({
      where: {
        project: projectScope,
        completedAt: { gte: thirtyDaysAgo },
      },
    }),
  ])

  return { activeProjects, inProgressTasks, completedLast30d }
}
