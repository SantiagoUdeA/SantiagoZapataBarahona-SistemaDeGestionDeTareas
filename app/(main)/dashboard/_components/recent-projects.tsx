import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getProjects } from '@/app/(main)/projects/queries'

type Status = 'En curso' | 'Completado' | 'Pendiente'

function deriveStatus(progress: number): Status {
  if (progress === 0) return 'Pendiente'
  if (progress === 100) return 'Completado'
  return 'En curso'
}

function getStatusColor(status: Status): string {
  switch (status) {
    case 'En curso':
      return 'bg-accent/10 text-accent'
    case 'Completado':
      return 'bg-primary/10 text-primary'
    case 'Pendiente':
      return 'bg-muted text-muted-foreground'
  }
}

function getProgressColor(status: Status): string {
  switch (status) {
    case 'En curso':
      return 'bg-accent'
    case 'Completado':
      return 'bg-primary'
    case 'Pendiente':
      return 'bg-muted-foreground/40'
  }
}

function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export async function RecentProjects({
  userId,
  isAdmin,
}: {
  userId: string
  isAdmin: boolean
}) {
  const projects = (await getProjects(userId, isAdmin)).slice(0, 5)

  if (projects.length === 0) {
    return (
      <div className='overflow-hidden rounded-lg border border-border bg-card'>
        <div className='flex flex-col items-center justify-center gap-2 py-16 text-center'>
          <p className='text-sm font-medium text-foreground'>
            Todavía no hay proyectos.
          </p>
          <p className='text-xs text-muted-foreground'>
            Crea tu primer proyecto para empezar a registrar tareas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-lg border border-border'>
      <Table className='w-full'>
        <TableHeader>
          <TableRow className='border-b bg-card hover:bg-transparent'>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Proyecto
            </TableHead>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Progreso
            </TableHead>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Estado
            </TableHead>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Responsable
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='bg-card'>
          {projects.map((project) => {
            const status = deriveStatus(project.progress)
            return (
              <TableRow key={project.id} className='hover:bg-muted/50'>
                <TableCell className='font-semibold text-foreground'>
                  {project.name}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-24 overflow-hidden rounded-full bg-muted'>
                      <div
                        className={`h-full ${getProgressColor(status)}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {project.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary' className={getStatusColor(status)}>
                    {status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-6 w-6'>
                      <AvatarFallback className='text-xs'>
                        {getInitials(project.owner.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-sm text-foreground'>
                      {project.owner.fullName || 'Sin asignar'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
