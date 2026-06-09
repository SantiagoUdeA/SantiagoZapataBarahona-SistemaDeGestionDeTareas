'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  MoreVerticalCircle01Icon,
  Edit01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
} from '@hugeicons/core-free-icons'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskCard } from './task-card'
import { CreateTaskDialog } from './create-task-dialog'
import { renameColumn, deleteColumn, setColumnDone } from '../actions'
import type { TaskRowData } from '../queries'

type BoardColumnData = {
  id: string
  name: string
  isDone: boolean
  position: number
  _count: { tasks: number }
}

interface BoardColumnProps {
  column: BoardColumnData
  tasks: TaskRowData[]
  isAdmin: boolean
  canManageColumns: boolean
  userId: string
  projectId: string
}

export function BoardColumn({
  column,
  tasks,
  isAdmin,
  canManageColumns,
  userId,
  projectId,
}: BoardColumnProps) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    attributes,
    listeners,
  } = useSortable({ id: column.id, data: { type: 'column' } })
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(column.name)
  const [renamePending, setRenamePending] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const taskIds = tasks.map((t) => t.id)

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setRenamePending(true)
    try {
      const result = await renameColumn(column.id, newName)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Columna renombrada')
        setRenaming(false)
      }
    } finally {
      setRenamePending(false)
    }
  }

  async function handleDelete() {
    const result = await deleteColumn(column.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Columna eliminada')
    }
  }

  async function handleToggleDone() {
    const result = await setColumnDone(column.id, !column.isDone)
    if (result.error) {
      toast.error(result.error)
    }
  }

  const headerClass = column.isDone
    ? 'border-b border-emerald-200 bg-emerald-50'
    : 'border-b border-slate-100 bg-muted/30'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        'flex w-72 shrink-0 flex-col',
        isDragging ? 'opacity-40' : '',
      ].join(' ')}
    >
      <Card className="flex flex-col overflow-hidden border-slate-200">
        {/* Column header */}
        <div
          className={`flex flex-row items-center justify-between gap-2 px-3 py-2.5 ${headerClass}`}
        >
          {renaming ? (
            <form onSubmit={handleRename} className="flex flex-1 gap-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                disabled={renamePending}
              />
              <Button size="sm" type="submit" className="h-7 px-2" disabled={renamePending}>
                OK
              </Button>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                className="h-7 px-2"
                onClick={() => {
                  setRenaming(false)
                  setNewName(column.name)
                }}
              >
                ✕
              </Button>
            </form>
          ) : (
            <>
              {canManageColumns && (
                <button
                  {...listeners}
                  {...attributes}
                  className="shrink-0 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
                  aria-label="Mover columna"
                >
                  <HugeiconsIcon icon={DragDropVerticalIcon} strokeWidth={2} className="size-4" />
                </button>
              )}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate font-heading text-sm font-medium">
                  {column.name}
                </span>
                <Badge variant="outline" className="shrink-0 tabular-nums">
                  {tasks.length}
                </Badge>
                {column.isDone && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    strokeWidth={2}
                    className="size-3.5 shrink-0 text-emerald-600"
                  />
                )}
              </div>

              {canManageColumns && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-muted-foreground"
                    >
                      <HugeiconsIcon
                        icon={MoreVerticalCircle01Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => setRenaming(true)}
                    >
                      <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4" />
                      Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleDone}>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                      {column.isDone ? 'Desmarcar como terminada' : 'Marcar como terminada'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>

        {/* Task list */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="max-h-[calc(100vh-280px)]">
            <div
              className={[
                'flex min-h-[60px] flex-col gap-2 p-2 transition-colors',
                isOver && !isDragging ? 'bg-indigo-50' : '',
              ].join(' ')}
            >
              <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isAdmin={isAdmin}
                    userId={userId}
                  />
                ))}
              </SortableContext>
              {tasks.length === 0 && (
                <div className="flex h-10 items-center justify-center text-xs text-muted-foreground">
                  Sin tareas
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Footer: add task */}
        <div className="border-t border-slate-100 px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setCreateOpen(true)}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-3.5" />
            Agregar tarea
          </Button>
        </div>
      </Card>

      <CreateTaskDialog
        projectId={projectId}
        defaultColumnId={column.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}
