import prisma from '@/lib/prisma'

export async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: { createdBy: userId },
    include: { owner: { select: { id: true, fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  })
}
