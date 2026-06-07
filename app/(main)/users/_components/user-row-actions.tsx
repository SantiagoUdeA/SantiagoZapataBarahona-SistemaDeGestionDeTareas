'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { deleteUser, toggleUserEnabled } from '../actions'

interface UserRowActionsProps {
  userId: string
  email: string
  enabled: boolean
}

export function UserRowActions({ userId, email, enabled }: UserRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleToggleEnabled() {
    startTransition(async () => {
      const result = await toggleUserEnabled(userId, !enabled)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(enabled ? 'Usuario deshabilitado' : 'Usuario habilitado')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario eliminado')
      }
      setConfirmOpen(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='h-8 w-8' disabled={pending}>
            <HugeiconsIcon icon={MoreVerticalIcon} className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={handleToggleEnabled}>
            {enabled ? 'Deshabilitar usuario' : 'Habilitar usuario'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setConfirmOpen(true)}>
            Eliminar usuario
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a "{email}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
