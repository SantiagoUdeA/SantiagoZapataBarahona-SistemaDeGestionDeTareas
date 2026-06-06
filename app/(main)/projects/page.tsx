import { Suspense } from 'react'
import { requireAuth, getSession } from '@/lib/auth/guard'
import { ProjectsList } from './_components/projects-list'
import { ProjectsSkeleton } from './_components/projects-skeleton'
import { CreateProjectDialog } from './_components/create-project-dialog'

export default async function ProjectsPage() {
  await requireAuth()
  const session = await getSession()

  return (
    <div className='container mx-auto py-10'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Projects</h2>
          <p className='text-muted-foreground'>Manage your projects here.</p>
        </div>
        <CreateProjectDialog />
      </div>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList userId={session?.id || ''} />
      </Suspense>
    </div>
  )
}
