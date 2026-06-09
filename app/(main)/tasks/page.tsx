import { Suspense } from 'react'
import { requireAuth, getSession } from '@/lib/auth/guard'
import { getSelectableProjects } from './queries'
import { ProjectSelector } from './_components/project-selector'
import { TaskBoard } from './_components/task-board'
import { TasksSkeleton } from './_components/tasks-skeleton'
import { ProgressChart } from './_components/progress-chart'
import prisma from '@/lib/prisma'

interface TasksPageProps {
  searchParams: Promise<{ projectId?: string }>
}

async function getProjectOwner(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { createdBy: true },
  })
  return project?.createdBy ?? null
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  await requireAuth()
  const session = await getSession()
  const { projectId } = await searchParams

  if (!session?.id) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-muted-foreground">Error cargando la sesión</p>
      </div>
    )
  }

  const isAdmin = session.role === 'ADMIN'
  const projects = await getSelectableProjects(session.id, isAdmin)
  const selectedProjectId =
    projectId && projects.some((p) => p.id === projectId)
      ? projectId
      : projects[0]?.id

  const ownerId = selectedProjectId
    ? await getProjectOwner(selectedProjectId)
    : null
  const isOwner = ownerId === session.id

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tareas</h2>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Gestiona las tareas de tus proyectos aquí.'
              : 'Consulta y avanza tus tareas.'}
          </p>
        </div>
      </div>

      <div className="mb-6 max-w-xs">
        <ProjectSelector projects={projects} selected={selectedProjectId} />
      </div>

      {selectedProjectId ? (
        <div className="space-y-6">
          <Suspense fallback={<TasksSkeleton />}>
            <TaskBoard
              projectId={selectedProjectId}
              userId={session.id}
              isAdmin={isAdmin}
              isOwner={isOwner}
            />
          </Suspense>
          <ProgressChart projectId={selectedProjectId} />
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
          Elige un proyecto para ver sus tareas.
        </div>
      )}
    </div>
  )
}
