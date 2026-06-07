'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateTaskStatus } from '../actions'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
}

const NEXT_STATUS: Record<string, 'IN_PROGRESS' | 'COMPLETED' | null> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: null,
}

const NEXT_LABEL: Record<string, string> = {
  PENDING: 'Iniciar',
  IN_PROGRESS: 'Marcar como completada',
}

interface TaskStatusControlProps {
  taskId: string
  status: string
  canAdvance: boolean
}

export function TaskStatusControl({ taskId, status, canAdvance }: TaskStatusControlProps) {
  const [pending, startTransition] = useTransition()
  const next = NEXT_STATUS[status]

  function handleAdvance() {
    if (!next) return
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, next)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(next === 'COMPLETED' ? 'Tarea marcada como completada' : 'Tarea actualizada')
      }
    })
  }

  return (
    <div className='flex items-center gap-2'>
      <Badge className={STATUS_BADGE_CLASSES[status]} variant='outline'>
        {STATUS_LABELS[status] ?? status}
      </Badge>
      {canAdvance && next && (
        <Button size='sm' variant='ghost' onClick={handleAdvance} disabled={pending}>
          {pending ? 'Actualizando...' : NEXT_LABEL[status]}
        </Button>
      )}
    </div>
  )
}
