'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  defaultColumnId?: string
  /** Controlled mode: provide open + onOpenChange together */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateTaskDialog({
  projectId,
  defaultColumnId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateTaskDialogProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? controlledOpen : internalOpen

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  function setOpen(next: boolean) {
    if (isControlled) {
      controlledOnOpenChange?.(next)
    } else {
      setInternalOpen(next)
    }
  }

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

  // Load profiles whenever dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function resetForm() {
    setTitle('')
    setDescription('')
    setAssigneeId('')
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
      const result = await createTask(
        projectId,
        title,
        assigneeId,
        description,
        defaultColumnId,
      )
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success('Tarea creada')
        resetForm()
        setOpen(false)
      }
    } finally {
      setPending(false)
    }
  }

  const dialogContent = (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Crear nueva tarea</DialogTitle>
        <DialogDescription>
          Describe la tarea y elige a la persona responsable.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ct-title">Título</Label>
          <Input
            id="ct-title"
            placeholder="Describe la tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-description">Descripción</Label>
          <Textarea
            id="ct-description"
            placeholder="Agrega una descripción para la tarea (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-assignee">Responsable</Label>
          <Select
            value={assigneeId}
            onValueChange={setAssigneeId}
            disabled={loading || pending}
          >
            <SelectTrigger id="ct-assignee" className="w-full">
              <SelectValue placeholder="Selecciona un responsable" />
            </SelectTrigger>
            <SelectContent>
              {profiles.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No hay miembros en este proyecto
                </div>
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
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  // Controlled mode: no trigger button
  if (isControlled) {
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) resetForm()
        }}
      >
        {dialogContent}
      </Dialog>
    )
  }

  // Uncontrolled mode: render with trigger button
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>Crear tarea</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
}
