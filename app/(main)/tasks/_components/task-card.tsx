'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HugeiconsIcon } from '@hugeicons/react'
import { DragDropVerticalIcon } from '@hugeicons/core-free-icons'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TaskDetailDialog } from './task-detail-dialog'
import type { TaskRowData } from '../queries'

function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface TaskCardProps {
  task: TaskRowData
  isAdmin: boolean
  userId: string
}

export function TaskCard({ task, isAdmin, userId }: TaskCardProps) {
  const [open, setOpen] = useState(false)
  const { transform, transition, setNodeRef, isDragging, attributes, listeners } =
    useSortable({ id: task.id, data: { type: 'task' } })

  const canEdit =
    isAdmin ||
    task.assignee?.id === userId ||
    task.createdBy?.id === userId

  const badgeClass = task.column.isDone
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-indigo-100 text-indigo-700 border-indigo-200'

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        data-dragging={isDragging}
        className="relative z-0 data-[dragging=true]:z-10"
      >
        <Card
          onClick={() => setOpen(true)}
          className={[
            'cursor-pointer border-slate-200 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
            isDragging ? 'opacity-80 shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : '',
          ].join(' ')}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              {/* Drag handle */}
              <button
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 shrink-0 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                aria-label="Arrastrar tarea"
              >
                <HugeiconsIcon
                  icon={DragDropVerticalIcon}
                  strokeWidth={2}
                  className="size-3.5"
                />
              </button>

              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium leading-snug line-clamp-2">
                  {task.title}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar size="sm">
                      <AvatarImage
                        src={task.assignee?.avatarUrl ?? undefined}
                        alt={task.assignee?.fullName ?? ''}
                      />
                      <AvatarFallback>
                        {initials(task.assignee?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">
                      {task.assignee?.fullName || 'Sin asignar'}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-full text-[0.6rem] ${badgeClass}`}
                  >
                    {task.column.isDone ? 'Listo' : task.column.name}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskDetailDialog
        task={task}
        canEdit={canEdit}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
