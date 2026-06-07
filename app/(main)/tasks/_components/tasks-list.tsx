import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getTasks, calculateProgress } from '../queries'
import { TaskStatusControl } from './task-status-control'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

interface TasksListProps {
  projectId: string
  userId: string
  isAdmin: boolean
}

export async function TasksList({ projectId, userId, isAdmin }: TasksListProps) {
  const tasks = await getTasks(projectId, userId, isAdmin)

  if (tasks === null) {
    return <p className='text-muted-foreground'>No tienes acceso a este proyecto.</p>
  }

  const progress = calculateProgress(tasks)

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <span className='text-sm font-medium'>Progreso del proyecto</span>
        <div className='flex items-center gap-2'>
          <div className='w-32 h-2 bg-muted rounded-full overflow-hidden'>
            <div className='h-full bg-indigo-500 transition-all' style={{ width: `${progress}%` }} />
          </div>
          <span className='text-xs text-muted-foreground w-10'>{progress}%</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Creada por</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className='text-center text-muted-foreground'>
                Este proyecto todavía no tiene tareas.
              </TableCell>
            </TableRow>
          )}
          {tasks.map((task) => {
            const canAdvance = isAdmin || task.assignee.id === userId
            return (
              <TableRow key={task.id}>
                <TableCell className='text-xs text-muted-foreground font-mono'>
                  {task.id.substring(0, 8)}
                </TableCell>
                <TableCell className='font-medium'>{task.title}</TableCell>
                <TableCell className='text-sm'>{task.assignee.fullName || 'Sin nombre'}</TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {task.createdBy.fullName || 'Sin nombre'}
                  {task.completedBy && (
                    <div className='text-xs'>Completada por {task.completedBy.fullName || 'Sin nombre'}</div>
                  )}
                </TableCell>
                <TableCell>
                  <TaskStatusControl taskId={task.id} status={task.status} canAdvance={canAdvance} />
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>{formatDate(task.createdAt)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
