import { Suspense } from 'react'
import { requireAuth, getSession } from '@/lib/auth/guard'
import { getMovements, getMovementFilterOptions } from './queries'
import { MovementsTable } from './_components/movements-table'
import { MovementsFilters } from './_components/movements-filters'
import { MovementsSkeleton } from './_components/movements-skeleton'
import type { Enum_MovementType } from '@/app/generated/prisma'

interface MovementsPageProps {
  searchParams: Promise<{ projectId?: string; type?: string }>
}

export default async function MovementsPage({ searchParams }: MovementsPageProps) {
  await requireAuth()
  const session = await getSession()

  if (!session?.id) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-muted-foreground">Error cargando la sesión</p>
      </div>
    )
  }

  const { projectId, type } = await searchParams
  const isAdmin = session.role === 'ADMIN'

  const { projects } = await getMovementFilterOptions(session.id, isAdmin)

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Movimientos</h2>
        <p className="text-muted-foreground">
          Registro de todas las acciones realizadas sobre las tareas.
        </p>
      </div>

      <div className="mb-6">
        <Suspense>
          <MovementsFilters projects={projects} />
        </Suspense>
      </div>

      <Suspense fallback={<MovementsSkeleton />}>
        <MovementsContent
          userId={session.id}
          isAdmin={isAdmin}
          projectId={projectId}
          type={type as Enum_MovementType | undefined}
        />
      </Suspense>
    </div>
  )
}

async function MovementsContent({
  userId,
  isAdmin,
  projectId,
  type,
}: {
  userId: string
  isAdmin: boolean
  projectId?: string
  type?: Enum_MovementType
}) {
  const movements = await getMovements({ userId, isAdmin, projectId, type })

  return <MovementsTable movements={movements} />
}
