'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateProject } from '../actions'

interface EditProjectDialogProps {
  projectId: string
  projectName: string
}

export function EditProjectDialog({
  projectId,
  projectName,
}: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(projectName)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('El nombre del proyecto es requerido')
      return
    }

    setPending(true)
    try {
      const result = await updateProject(projectId, name)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Proyecto actualizado')
        setOpen(false)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar proyecto</DialogTitle>
          <DialogDescription>Actualiza el nombre del proyecto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Nombre del proyecto</Label>
            <Input
              id='name'
              placeholder='Ingresa el nombre del proyecto'
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
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
              {pending ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
