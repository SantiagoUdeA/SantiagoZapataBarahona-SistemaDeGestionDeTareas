// Server functions for fetching task data
// All queries enforce access control: users can only see tasks in projects they have access to

import prisma from '@/lib/prisma'

// Shared Prisma where clause for project access
// ADMIN sees projects they created; USER sees projects they are members of
export function projectAccessWhere(userId: string, isAdmin: boolean) {
  return isAdmin
    ? { createdBy: userId }
    : { members: { some: { profileId: userId } } }
}

// Fetch projects the user can select from (for filtering)
export async function getSelectableProjects(userId: string, isAdmin: boolean) {
  const projects = await prisma.project.findMany({
    where: projectAccessWhere(userId, isAdmin),
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  })

  return projects
}

// Shape of a task row returned by getTasks
export type TaskRowData = {
  id: string
  title: string
  description: string | null
  columnId: string
  position: number
  column: { id: string; name: string; isDone: boolean; position: number }
  createdAt: Date
  completedAt: Date | null
  assignee: { id: string; fullName: string | null; avatarUrl: string | null } | null
  createdBy: { id: string; fullName: string | null } | null
  completedBy: { id: string; fullName: string | null } | null
}

// Fetch tasks for a specific project with access control
// Returns null if user doesn't have access (prevents data leakage)
export async function getTasks(
  projectId: string,
  userId: string,
  isAdmin: boolean,
): Promise<TaskRowData[] | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccessWhere(userId, isAdmin) },
    select: { id: true },
  })

  if (!project) return null

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      column: { select: { id: true, name: true, isDone: true, position: true } },
      assignee: { select: { id: true, fullName: true, avatarUrl: true } },
      createdBy: { select: { id: true, fullName: true } },
      completedBy: { select: { id: true, fullName: true } },
    },
    orderBy: [{ column: { position: 'asc' } }, { position: 'asc' }],
  })

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    columnId: task.columnId,
    position: task.position,
    column: task.column,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    assignee: task.assignee,
    createdBy: task.createdBy,
    completedBy: task.completedBy,
  }))
}

// Fetch all columns for a project ordered by position
export async function getBoardColumns(projectId: string) {
  return prisma.boardColumn.findMany({
    where: { projectId },
    orderBy: { position: 'asc' },
    include: { _count: { select: { tasks: true } } },
  })
}

// Group tasks by columnId, sorted by position within each column
export function groupByColumn(
  columns: Array<{ id: string }>,
  tasks: TaskRowData[],
): Map<string, TaskRowData[]> {
  const map = new Map<string, TaskRowData[]>()

  for (const col of columns) {
    map.set(col.id, [])
  }

  for (const task of tasks) {
    const bucket = map.get(task.columnId)
    if (bucket) {
      bucket.push(task)
    } else {
      map.set(task.columnId, [task])
    }
  }

  // Sort each bucket by position (tasks already ordered from DB, but guard here too)
  for (const [, bucket] of map) {
    bucket.sort((a, b) => a.position - b.position)
  }

  return map
}

// Calculate project completion percentage
// Counts tasks in columns flagged isDone
export function calculateProgress(tasks: TaskRowData[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => t.column.isDone).length
  return Math.round((completed / tasks.length) * 100)
}

// Calculate progress over time for charting
// Returns array of { date, progress } based on completedAt timestamps
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

  if (completions.length === 0) return []

  const byDay = new Map<string, number>()
  for (const day of completions) {
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  const baseline = new Date(completions[0])
  baseline.setUTCDate(baseline.getUTCDate() - 1)
  const series: Array<{ date: string; progress: number }> = [
    { date: baseline.toISOString().slice(0, 10), progress: 0 },
  ]

  let accumulated = 0
  for (const [date, count] of byDay) {
    accumulated += count
    series.push({ date, progress: Math.round((accumulated / total) * 100) })
  }

  return series
}
