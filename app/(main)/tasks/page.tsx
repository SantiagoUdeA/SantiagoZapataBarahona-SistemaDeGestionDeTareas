import { Suspense } from 'react'
import { requireAuth, getSession } from '@/lib/auth/guard'
import { getSelectableProjects } from './queries'
import { ProjectSelector } from './_components/project-selector'
import { TasksList } from './_components/tasks-list'
import { TasksSkeleton } from './_components/tasks-skeleton'
import { CreateTaskDialog } from './_components/create-task-dialog'
import { ProgressChart } from './_components/progress-chart'

interface TasksPageProps {
  searchParams: Promise<{ projectId?: string }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await requireAuth()
  const session = await getSession()
  const { projectId } = await searchParams

  if (!session?.id) {
    return (
      <div className='container mx-auto py-10'>
        <p className='text-muted-foreground'>Error cargando la sesión</p>
      </div>
    )
  }

  const isAdmin = session.role === 'ADMIN'
  const projects = await getSelectableProjects(session.id, isAdmin)
  const selectedProjectId = projectId && projects.some((p) => p.id === projectId) ? projectId : undefined

  return (
    <div className='container mx-auto px-6 py-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Tareas</h2>
          <p className='text-muted-foreground'>
            {user.role === 'ADMIN' ? 'Gestiona las tareas de tus proyectos aquí.' : 'Consulta y avanza tus tareas aquí.'}
          </p>
        </div>
        {selectedProjectId && (
          <CreateTaskDialog projectId={selectedProjectId} />
        )}
      </div>

      <div className='mb-6 max-w-xs'>
        <ProjectSelector projects={projects} selected={selectedProjectId} />
      </div>

      {selectedProjectId ? (
        <div className='space-y-6'>
          <Suspense fallback={<TasksSkeleton />}>
            <TasksList projectId={selectedProjectId} userId={session.id} isAdmin={isAdmin} />
          </Suspense>
          <ProgressChart projectId={selectedProjectId} />
        </div>
      ) : (
        <div className='rounded-md border border-dashed p-10 text-center text-muted-foreground'>
          Elige un proyecto para ver sus tareas.
        </div>
      )}
    </div>
  )
}
