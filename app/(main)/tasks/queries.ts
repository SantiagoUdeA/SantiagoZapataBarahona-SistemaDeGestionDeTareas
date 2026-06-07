import prisma from '@/lib/prisma'

export async function getSelectableProjects(userId: string, isAdmin: boolean) {
  const projects = await prisma.project.findMany({
    where: isAdmin
      ? { createdBy: userId }
      : { members: { some: { profileId: userId } } },
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  })

  return projects
}

export async function getTasks(projectId: string, userId: string, isAdmin: boolean) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(isAdmin
        ? { createdBy: userId }
        : { members: { some: { profileId: userId } } }),
    },
    select: { id: true },
  })

  if (!project) {
    return null
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, fullName: true, avatarUrl: true } },
      createdBy: { select: { id: true, fullName: true } },
      completedBy: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    assignee: task.assignee,
    createdBy: task.createdBy,
    completedBy: task.completedBy,
  }))
}

export function calculateProgress(tasks: Array<{ status: string }>) {
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  return Math.round((completed / tasks.length) * 100)
}

export async function getProgressOverTime(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: { completedAt: true },
  })

  const total = tasks.length
  if (total === 0) return []

  const completions = tasks
    .filter((t): t is { completedAt: Date } => t.completedAt !== null)
    .map((t) => t.completedAt.toISOString().slice(0, 10))
    .sort()

  const byDay = new Map<string, number>()
  for (const day of completions) {
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  let accumulated = 0
  const series: Array<{ date: string; progress: number }> = []
  for (const [date, count] of byDay) {
    accumulated += count
    series.push({ date, progress: Math.round((accumulated / total) * 100) })
  }

  return series
}
