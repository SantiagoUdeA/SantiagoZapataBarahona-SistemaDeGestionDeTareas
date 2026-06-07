'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { UserGroupIcon, Delete02Icon } from '@hugeicons/core-free-icons'
import { getProjectMembers } from '../actions'
import { assignUserToProject, removeUserFromProject } from '../../users/actions'

type Profile = { id: string; fullName: string | null; avatarUrl: string | null }

function initials(name: string | null) {
  const source = name?.trim() || '?'
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface ManageMembersDialogProps {
  projectId: string
  projectName: string
}

export function ManageMembersDialog({ projectId, projectName }: ManageMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Profile[]>([])
  const [assignable, setAssignable] = useState<Profile[]>([])
  const [selected, setSelected] = useState<string>('')
  const [pending, startTransition] = useTransition()

  async function load() {
    setLoading(true)
    try {
      const result = await getProjectMembers(projectId)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      setMembers(result.members)
      setAssignable(result.assignable)
      setSelected('')
    } finally {
      setLoading(false)
    }
  }

  function handleAssign() {
    if (!selected) return
    startTransition(async () => {
      const result = await assignUserToProject(projectId, selected)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario asignado al proyecto')
        await load()
      }
    })
  }

  function handleRemove(profileId: string) {
    startTransition(async () => {
      const result = await removeUserFromProject(projectId, profileId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario eliminado del proyecto')
        await load()
      }
    })
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
        <Button variant='outline' size='sm'>
          <HugeiconsIcon icon={UserGroupIcon} className='h-4 w-4' />
          Miembros
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestionar miembros — {projectName}</DialogTitle>
          <DialogDescription>
            Asigna usuarios al proyecto para que puedan colaborar en las tareas. 
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex gap-2'>
            <Select value={selected} onValueChange={setSelected} disabled={loading || pending}>
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder='Seleccionar un usuario' />
              </SelectTrigger>
              <SelectContent>
                {assignable.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.fullName || 'Usuario sin nombre'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} disabled={!selected || loading || pending}>
              Asignar
            </Button>
          </div>

          <div className='space-y-2'>
            {loading && (
              <p className='text-sm text-muted-foreground'>Cargando miembros...</p>
            )}
            {!loading && members.length === 0 && (
              <p className='text-sm text-muted-foreground'>No hay miembros asignados aún.</p>
            )}
            {members.map((member) => (
              <div key={member.id} className='flex items-center justify-between rounded-md border px-3 py-2'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-7 w-7'>
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.fullName ?? ''} />}
                    <AvatarFallback className='text-xs'>{initials(member.fullName)}</AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium'>{member.fullName || 'Usuario sin nombre'}</span>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-destructive hover:text-destructive'
                  onClick={() => handleRemove(member.id)}
                  disabled={pending}
                >
                  <HugeiconsIcon icon={Delete02Icon} className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
