import { Suspense } from 'react'
import { requireAuth, getSession } from '@/lib/auth/guard'
import { ProjectsList } from './_components/projects-list'
import { ProjectsSkeleton } from './_components/projects-skeleton'
import { CreateProjectDialog } from './_components/create-project-dialog'

export default async function ProjectsPage() {
  const user = await requireAuth()
  const session = await getSession()

  if (!session?.id) {
    return (
      <div className='container mx-auto py-10'>
        <p className='text-muted-foreground'>Error cargando la sesión</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-6 py-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Proyectos</h2>
          <p className='text-muted-foreground'>{user.role === 'ADMIN' ? 'Gestiona tus proyectos aquí.' : 'Visualiza tus proyectos aquí.'}</p>
        </div>
        {session.role === 'ADMIN' && <CreateProjectDialog />}
      </div>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList userId={session.id} isAdmin={session.role === 'ADMIN'} />
      </Suspense>
    </div>
  )
}
