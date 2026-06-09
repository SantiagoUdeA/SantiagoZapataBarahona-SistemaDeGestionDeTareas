'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateTask } from '../actions'
import type { TaskRowData } from '../queries'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

interface TaskDetailDialogProps {
  task: TaskRowData
  canEdit: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({
  task,
  canEdit,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [pending, setPending] = useState(false)

  function resetForm() {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setEditing(false)
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) resetForm()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('El título es requerido')
      return
    }

    setPending(true)
    try {
      const result = await updateTask(task.id, title, description)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Tarea actualizada')
        setEditing(false)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Editar tarea</DialogTitle>
              <DialogDescription>
                Modifica el título y la descripción de la tarea.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="task-title">Título</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Descripción</Label>
              <Textarea
                id="task-description"
                placeholder="Agrega una descripción para la tarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={pending}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Columna: {task.column.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Descripción
                </Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {description.trim() || 'Sin descripción'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Responsable
                  </Label>
                  <p>{task.assignee?.fullName || 'Sin asignar'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Creada por
                  </Label>
                  <p>{task.createdBy?.fullName || 'Desconocido'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Fecha de creación
                  </Label>
                  <p>{formatDate(task.createdAt)}</p>
                </div>
                {task.completedAt && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Completada
                    </Label>
                    <p>{formatDate(task.completedAt)}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
              {canEdit && (
                <Button type="button" onClick={() => setEditing(true)}>
                  Editar
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
