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
import { HugeiconsIcon } from '@hugeicons/react'
import { UserAdd02Icon } from '@hugeicons/core-free-icons'
import { createUser } from '../actions'

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER')
  const [pending, setPending] = useState(false)

  function reset() {
    setEmail('')
    setFullName('')
    setRole('USER')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('El correo electrónico es obligatorio')
      return
    }

    setPending(true)
    try {
      const result = await createUser({
        email: email.trim(),
        fullName: fullName.trim() || undefined,
        role,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario creado. La contraseña predeterminada es su correo electrónico.')
        reset()
        setOpen(false)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset() }}>
      <DialogTrigger asChild>
        <Button>
          <HugeiconsIcon icon={UserAdd02Icon} className='h-4 w-4' />
          Crear usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            El usuario se crea con su correo electrónico como contraseña
            predeterminada y debe cambiarla en su primer inicio de sesión.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Correo electrónico</Label>
            <Input
              id='email'
              type='email'
              placeholder='name@company.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='fullName'>Nombre completo</Label>
            <Input
              id='fullName'
              placeholder='Opcional'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='role'>Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'ADMIN' | 'USER')} disabled={pending}>
              <SelectTrigger id='role' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ADMIN'>Administrador</SelectItem>
                <SelectItem value='USER'>Usuario</SelectItem>
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
              {pending ? 'Creando...' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
