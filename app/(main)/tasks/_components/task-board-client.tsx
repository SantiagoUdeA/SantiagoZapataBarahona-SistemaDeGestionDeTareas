'use client'

import {
  DndContext,
  DragOverlay,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { DragDropVerticalIcon } from '@hugeicons/core-free-icons'
import { BoardColumn } from './board-column'
import { AddColumnInline } from './add-column-inline'
import { useBoardDnd } from './use-board-dnd'
import type { TaskRowData } from '../queries'

type BoardColumnData = {
  id: string
  name: string
  isDone: boolean
  position: number
  _count: { tasks: number }
}

interface TaskBoardClientProps {
  columns: BoardColumnData[]
  initialTasks: Record<string, TaskRowData[]>
  projectId: string
  userId: string
  isAdmin: boolean
  canManageColumns: boolean
}

export function TaskBoardClient({
  columns,
  initialTasks,
  projectId,
  userId,
  isAdmin,
  canManageColumns,
}: TaskBoardClientProps) {
  const {
    columnsState,
    columnsOrder,
    activeDrag,
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd,
  } = useBoardDnd({ columns, initialTasks })

  const columnMap = Object.fromEntries(columns.map((c) => [c.id, c]))
  const orderedColumns = columnsOrder.map((id) => columnMap[id]).filter(Boolean)

  const activeColumn = activeDrag?.type === 'column' ? columnMap[activeDrag.id] : null
  const activeTask =
    activeDrag?.type === 'task'
      ? Object.values(columnsState)
          .flat()
          .find((t) => t.id === activeDrag.id) ?? null
      : null

  if (orderedColumns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <p className="text-sm text-muted-foreground">
          Este proyecto todavía no tiene columnas.
        </p>
        {canManageColumns && <AddColumnInline projectId={projectId} />}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={columnsOrder} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {orderedColumns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={columnsState[column.id] ?? []}
              isAdmin={isAdmin}
              canManageColumns={canManageColumns}
              userId={userId}
              projectId={projectId}
            />
          ))}

          {canManageColumns && (
            <div className="flex shrink-0 items-start">
              <AddColumnInline projectId={projectId} />
            </div>
          )}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeColumn && (
          <ColumnDragOverlay
            column={activeColumn}
            taskCount={columnsState[activeColumn.id]?.length ?? 0}
          />
        )}
        {activeTask && <TaskDragOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  )
}

// Overlay rendered while dragging a column
function ColumnDragOverlay({
  column,
  taskCount,
}: {
  column: BoardColumnData
  taskCount: number
}) {
  const headerClass = column.isDone
    ? 'border-b border-emerald-200 bg-emerald-50'
    : 'border-b border-slate-100 bg-muted/30'

  return (
    <div className="w-72 rotate-2 opacity-95">
      <Card className="overflow-hidden border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <div className={`flex items-center gap-2 px-3 py-2.5 ${headerClass}`}>
          <HugeiconsIcon
            icon={DragDropVerticalIcon}
            strokeWidth={2}
            className="size-4 shrink-0 text-muted-foreground/40"
          />
          <span className="truncate font-heading text-sm font-medium">{column.name}</span>
          <Badge variant="outline" className="ml-auto shrink-0 tabular-nums">
            {taskCount}
          </Badge>
        </div>
      </Card>
    </div>
  )
}

// Overlay rendered while dragging a task
function TaskDragOverlay({ task }: { task: TaskRowData }) {
  return (
    <div className="w-64 rotate-1 opacity-95">
      <Card className="border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <HugeiconsIcon
              icon={DragDropVerticalIcon}
              strokeWidth={2}
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            />
            <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
