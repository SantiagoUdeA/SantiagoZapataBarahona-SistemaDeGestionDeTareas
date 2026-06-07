'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskStatusControl } from './task-status-control'
import { updateTask } from '../actions'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

type Profile = { id: string; fullName: string | null; avatarUrl?: string | null }

export type TaskRowData = {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: Date
  assignee: Profile
  createdBy: { id: string; fullName: string | null }
  completedBy: { id: string; fullName: string | null } | null
}

interface TaskRowProps {
  task: TaskRowData
  canAdvance: boolean
}

export function TaskRow({ task, canAdvance }: TaskRowProps) {
  const [open, setOpen] = useState(false)
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
    setOpen(next)
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
    <>
      <TableRow className='cursor-pointer' onClick={() => setOpen(true)}>
        <TableCell className='text-xs text-muted-foreground font-mono'>
          {task.id.substring(0, 8)}
        </TableCell>
        <TableCell className='font-medium'>{task.title}</TableCell>
        <TableCell className='text-sm'>{task.assignee.fullName || 'Sin nombre'}</TableCell>
        <TableCell className='text-sm text-muted-foreground'>
          {task.createdBy.fullName || 'Sin nombre'}
          {task.completedBy && (
            <div className='text-xs'>Completada por {task.completedBy.fullName || 'Sin nombre'}</div>
          )}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <TaskStatusControl taskId={task.id} status={task.status} canAdvance={canAdvance} />
        </TableCell>
        <TableCell className='text-sm text-muted-foreground'>{formatDate(task.createdAt)}</TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          {editing ? (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <DialogHeader>
                <DialogTitle>Editar tarea</DialogTitle>
                <DialogDescription>Modifica el título y la descripción de la tarea.</DialogDescription>
              </DialogHeader>
              <div className='space-y-2'>
                <Label htmlFor='task-title'>Título</Label>
                <Input
                  id='task-title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='task-description'>Descripción</Label>
                <Textarea
                  id='task-description'
                  placeholder='Agrega una descripción para la tarea'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={pending}
                />
              </div>
              <DialogFooter>
                <Button type='button' variant='outline' onClick={resetForm} disabled={pending}>
                  Cancelar
                </Button>
                <Button type='submit' disabled={pending}>
                  {pending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>Detalle de la tarea.</DialogDescription>
              </DialogHeader>
              <div className='space-y-2'>
                <Label>Descripción</Label>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {description.trim() || 'Sin descripción'}
                </p>
              </div>
              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                  Cerrar
                </Button>
                <Button type='button' onClick={() => setEditing(true)}>
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
