// Server functions for fetching task data
// All queries enforce access control: users can only see tasks in projects they have access to

import prisma from '@/lib/prisma'

// Fetch projects the user can select from (for filtering)
// ADMIN: sees all their created projects
// USER: sees only projects they're members of
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

// Fetch tasks for a specific project with access control
// First verifies user has access to the project, then fetches its tasks
// Returns null if user doesn't have access (prevents data leakage)
export async function getTasks(projectId: string, userId: string, isAdmin: boolean) {
  // Check project access first
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
    return null  // Access denied
  }

  // Fetch all tasks with related user info for UI display
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
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    assignee: task.assignee,
    createdBy: task.createdBy,
    completedBy: task.completedBy,
  }))
}

// Calculate project completion percentage
// Helper used by both UI and progress tracking
export function calculateProgress(tasks: Array<{ status: string }>) {
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  return Math.round((completed / tasks.length) * 100)
}

// Calculate progress over time for charting
// Returns array of dates with cumulative completion percentages
// Ensures at least one baseline point (day before first completion) for chart rendering
export async function getProgressOverTime(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: { completedAt: true },
  })

  const total = tasks.length
  if (total === 0) return []

  // Get completion dates in chronological order
  const completions = tasks
    .filter((t): t is { completedAt: Date } => t.completedAt !== null)
    .map((t) => t.completedAt.toISOString().slice(0, 10))
    .sort()

  if (completions.length === 0) return []

  // Group completions by day
  const byDay = new Map<string, number>()
  for (const day of completions) {
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  // Add baseline point at day before first completion
  // Ensures chart has at least 2 data points even if all tasks complete same day
  const baseline = new Date(completions[0])
  baseline.setUTCDate(baseline.getUTCDate() - 1)
  const series: Array<{ date: string; progress: number }> = [
    { date: baseline.toISOString().slice(0, 10), progress: 0 },
  ]

  // Build series with cumulative progress
  let accumulated = 0
  for (const [date, count] of byDay) {
    accumulated += count
    series.push({ date, progress: Math.round((accumulated / total) * 100) })
  }

  return series
}
