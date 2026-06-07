import { Suspense } from 'react'
import { requireAuth, getSession } from '@/lib/auth/guard'
import { CreateProjectDialog } from '@/app/(main)/projects/_components/create-project-dialog'
import { DashboardMetrics } from './_components/dashboard-metrics'
import { RecentProjects } from './_components/recent-projects'
import {
  DashboardMetricsSkeleton,
  DashboardProjectsSkeleton,
} from './_components/dashboard-skeleton'

export default async function DashboardPage() {
  await requireAuth()
  const session = await getSession()

  if (!session?.id) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <p className='text-muted-foreground'>Error cargando la sesión</p>
      </div>
    )
  }

  const isAdmin = session.role === 'ADMIN'

  return (
    <div className='container mx-auto flex flex-col gap-6 px-6 py-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Panel</h2>
          <p className='text-muted-foreground'>
            Resumen de tus proyectos y tareas recientes.
          </p>
        </div>
        {isAdmin && <CreateProjectDialog />}
      </div>

      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <DashboardMetrics userId={session.id} isAdmin={isAdmin} />
      </Suspense>

      <Suspense fallback={<DashboardProjectsSkeleton />}>
        <RecentProjects userId={session.id} isAdmin={isAdmin} />
      </Suspense>
    </div>
  )
}
