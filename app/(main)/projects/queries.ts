import prisma from '@/lib/prisma'

export async function getProjects(userId: string, isAdmin: boolean) {
  const projects = await prisma.project.findMany({
    where: isAdmin
      ? { createdBy: userId }
      : { members: { some: { profileId: userId } } },
    include: {
      owner: { select: { id: true, fullName: true, avatarUrl: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return projects.map((project) => {
    const progress = calculateProgress(project.tasks)
    return {
      id: project.id,
      name: project.name,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      owner: project.owner,
      progress,
    }
  })
}

function calculateProgress(tasks: Array<{ status: string }>) {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  return Math.round((completed / tasks.length) * 100)
}
