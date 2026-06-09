import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { TaskMovement } from '../queries'
import type { Enum_MovementType } from '@/app/generated/prisma'

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function initials(name: string | null) {
  if (!name) return '??'
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const TYPE_LABELS: Record<Enum_MovementType, string> = {
  CREATED: 'Creación',
  UPDATED: 'Edición',
  COLUMN_CHANGED: 'Cambio de columna',
  REORDERED: 'Reordenamiento',
  DELETED: 'Eliminación',
}

const TYPE_BADGE_CLASS: Record<Enum_MovementType, string> = {
  CREATED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  UPDATED: 'bg-slate-100 text-slate-700 border-slate-200',
  COLUMN_CHANGED: 'bg-violet-100 text-violet-700 border-violet-200',
  REORDERED: 'bg-slate-100 text-slate-600 border-slate-200',
  DELETED: 'bg-red-100 text-red-700 border-red-200',
}

function getDetail(movement: TaskMovement): string {
  switch (movement.type) {
    case 'COLUMN_CHANGED':
      return `${movement.fromColumn ?? '?'} → ${movement.toColumn ?? '?'}`
    case 'REORDERED': {
      const d = movement.detail as { fromPosition?: number; toPosition?: number } | null
      if (d && d.fromPosition !== undefined && d.toPosition !== undefined) {
        return `Posición ${d.fromPosition + 1} → ${d.toPosition + 1}`
      }
      return 'Reordenada'
    }
    case 'UPDATED':
      return 'Tarea editada'
    case 'CREATED':
      return movement.toColumn ? `Tarea creada en ${movement.toColumn}` : 'Tarea creada'
    case 'DELETED':
      return 'Tarea eliminada'
    default:
      return ''
  }
}

interface MovementsTableProps {
  movements: TaskMovement[]
}

export function MovementsTable({ movements }: MovementsTableProps) {
  if (movements.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No hay movimientos registrados.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha y hora</TableHead>
          <TableHead>Quién</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Tarea</TableHead>
          <TableHead>Detalle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDateTime(m.createdAt)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage
                    src={m.actor.avatarUrl ?? undefined}
                    alt={m.actor.fullName ?? undefined}
                  />
                  <AvatarFallback>{initials(m.actor.fullName)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{m.actor.fullName}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={`rounded-full ${TYPE_BADGE_CLASS[m.type]}`}
              >
                {TYPE_LABELS[m.type]}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-sm">
              {m.taskTitle}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {getDetail(m)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
