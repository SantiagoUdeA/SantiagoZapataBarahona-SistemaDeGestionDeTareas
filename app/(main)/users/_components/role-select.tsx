'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { updateUserRole } from '../actions'

const ROLE_STYLES: Record<'ADMIN' | 'USER', { dot: string; pill: string }> = {
  ADMIN: { dot: 'bg-indigo-500', pill: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  USER: { dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-700 border-slate-200' },
}

export function RoleSelect({ userId, role }: { userId: string; role: 'ADMIN' | 'USER' }) {
  const [value, setValue] = useState(role)
  const [pending, startTransition] = useTransition()

  function handleChange(next: string) {
    const nextRole = next as 'ADMIN' | 'USER'
    if (nextRole === value) return

    const previous = value
    setValue(nextRole)
    startTransition(async () => {
      const result = await updateUserRole(userId, nextRole)
      if (result.error) {
        setValue(previous)
        toast.error(result.error)
      } else {
        toast.success('Rol actualizado')
      }
    })
  }

  const styles = ROLE_STYLES[value]

  return (
    <Select value={value} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger
        size='sm'
        className={cn(
          'h-6 rounded-full border px-2.5 text-[0.625rem] font-semibold uppercase tracking-wider gap-1.5',
          styles.pill
        )}
      >
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full', styles.dot)} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='ADMIN'>Administrador</SelectItem>
        <SelectItem value='USER'>Usuario</SelectItem>
      </SelectContent>
    </Select>
  )
}
