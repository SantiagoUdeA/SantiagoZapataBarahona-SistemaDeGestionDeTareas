import prisma from '@/lib/prisma'

export async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: { createdBy: userId },
    include: { owner: { select: { id: true, profile: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
}
