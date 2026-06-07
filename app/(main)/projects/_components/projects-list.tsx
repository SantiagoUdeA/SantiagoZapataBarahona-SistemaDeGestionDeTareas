import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProjects } from '../queries'
import { ProjectRowActions } from './project-row-actions'

export async function ProjectsList({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const projects = await getProjects(userId, isAdmin)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Progreso</TableHead>
          <TableHead>Creado por</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className='text-xs text-muted-foreground font-mono'>
              {project.id.substring(0, 8)}
            </TableCell>
            <TableCell className='font-medium'>{project.name}</TableCell>
            <TableCell>
              <div className='flex items-center gap-2'>
                <div className='w-32 h-2 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-indigo-500 transition-all'
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className='text-xs text-muted-foreground w-10'>
                  {project.progress}%
                </span>
              </div>
            </TableCell>
            <TableCell className='text-sm'>{project.owner.fullName || 'Unknown'}</TableCell>
            <TableCell>
              <ProjectRowActions project={project} isAdmin={isAdmin} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
