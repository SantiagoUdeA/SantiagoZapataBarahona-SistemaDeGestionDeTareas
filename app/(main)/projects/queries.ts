import { unstable_cache } from 'next/cache'
import prisma from '@/lib/prisma'

export const getProjects = unstable_cache(
  async (userId: string) => {
    return prisma.project.findMany({
      where: { createdBy: userId },
      include: { owner: { select: { id: true, profile: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['projects'],
  {
    revalidate: 3600,
  }
)
