import { getBoardColumns, getTasks, groupByColumn, calculateProgress } from '../queries'
import { TaskBoardClient } from './task-board-client'

interface TaskBoardProps {
  projectId: string
  userId: string
  isAdmin: boolean
  isOwner: boolean
}

export async function TaskBoard({ projectId, userId, isAdmin, isOwner }: TaskBoardProps) {
  const [columns, tasks] = await Promise.all([
    getBoardColumns(projectId),
    getTasks(projectId, userId, isAdmin),
  ])

  if (tasks === null) {
    return (
      <p className="text-muted-foreground">No tienes acceso a este proyecto.</p>
    )
  }

  const grouped = groupByColumn(columns, tasks)
  const progress = calculateProgress(tasks)

  const initialTasks: Record<string, import('../queries').TaskRowData[]> = {}
  for (const col of columns) {
    initialTasks[col.id] = grouped.get(col.id) ?? []
  }

  const canManageColumns = isAdmin || isOwner

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Progreso del proyecto</span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-10 text-xs text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <TaskBoardClient
        columns={columns}
        initialTasks={initialTasks}
        projectId={projectId}
        userId={userId}
        isAdmin={isAdmin}
        canManageColumns={canManageColumns}
      />
    </div>
  )
}
