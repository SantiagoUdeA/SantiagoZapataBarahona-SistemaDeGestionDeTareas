import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRoleInRoute, jsonError } from '@/lib/api/auth'

export async function GET(req: NextRequest) {
  const { session, status, error } = await requireRoleInRoute('ADMIN')
  if (status) return jsonError(error, status)

  const { searchParams } = new URL(req.url)
  const enabled = searchParams.get('enabled')
  const deleted = searchParams.get('deleted') === 'true'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const where: any = {
      deleted: deleted ? true : false,
    }

    if (enabled !== null) {
      where.enabled = enabled === 'true'
    }

    const users = await prisma.profile.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (err) {
    return jsonError('Failed to fetch users', 500)
  }
}
