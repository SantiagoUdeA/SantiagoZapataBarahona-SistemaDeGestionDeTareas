// API route: GET /api/users
// Lists all users (profiles) with pagination and filtering
// ADMIN only access required

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRoleInRoute, jsonError } from '@/lib/api/auth'

export async function GET(req: NextRequest) {
  // Verify admin role
  const { session, status, error } = await requireRoleInRoute('ADMIN')
  if (status) return jsonError(error, status)

  // Parse query parameters
  const { searchParams } = new URL(req.url)
  const enabled = searchParams.get('enabled')  // Filter by account enabled status
  const deleted = searchParams.get('deleted') === 'true'  // Include soft-deleted users (default: false)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)  // Pagination limit (max 100)
  const offset = parseInt(searchParams.get('offset') || '0')  // Pagination offset

  try {
    // Build where clause for filtering
    const where: any = {
      deleted: deleted ? true : false,
    }

    // Optional: filter by enabled status
    if (enabled !== null) {
      where.enabled = enabled === 'true'
    }

    // Fetch paginated results
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
