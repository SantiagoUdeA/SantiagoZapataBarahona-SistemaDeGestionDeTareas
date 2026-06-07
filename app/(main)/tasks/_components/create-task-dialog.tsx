'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createTask, getAssignableProfiles } from '../actions'

type Profile = { id: string; fullName: string | null; avatarUrl: string | null }

interface CreateTaskDialogProps {
  projectId: string
}

export function CreateTaskDialog({ projectId }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const result = await getAssignableProfiles(projectId)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      setProfiles(result.profiles)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('El título de la tarea es requerido')
      return
    }
    if (!assigneeId) {
      toast.error('Elige un responsable para la tarea')
      return
    }

    setPending(true)
    try {
      const result = await createTask(projectId, title, assigneeId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Tarea creada')
        setTitle('')
        setAssigneeId('')
        setOpen(false)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) load()
      }}
    >
      <DialogTrigger asChild>
        <Button>Crear tarea</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva tarea</DialogTitle>
          <DialogDescription>
            Describe la tarea y elige a la persona responsable. Quedará en estado pendiente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Título</Label>
            <Input
              id='title'
              placeholder='Describe la tarea'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='assignee'>Responsable</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId} disabled={loading || pending}>
              <SelectTrigger id='assignee' className='w-full'>
                <SelectValue placeholder='Selecciona un responsable' />
              </SelectTrigger>
              <SelectContent>
                {profiles.length === 0 && (
                  <div className='px-2 py-1.5 text-sm text-muted-foreground'>No hay miembros en este proyecto</div>
                )}
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.fullName || 'Usuario sin nombre'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={pending}>
              {pending ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
