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
} from '@/components/ui/dialog'
import { createColumn } from '../actions'

interface AddColumnDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddColumnDialog({
  projectId,
  open,
  onOpenChange,
}: AddColumnDialogProps) {
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('El nombre de la columna es requerido')
      return
    }

    setPending(true)
    try {
      const result = await createColumn(projectId, name)
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success('Columna creada')
        setName('')
        onOpenChange(false)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          onOpenChange(next)
          if (!next) setName('')
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar columna</DialogTitle>
          <DialogDescription>
            Ingresa un nombre para la nueva columna del tablero.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="column-name">Nombre</Label>
            <Input
              id="column-name"
              placeholder="Por ejemplo: En revisión"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
    </Dialog>
  )
}
