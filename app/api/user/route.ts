// API route: /api/user
// CRUD operations for user profiles
// GET: Fetch profile by ID (authenticated users)
// POST: Update own profile (authenticated users)
// PUT: Update any profile (ADMIN only)
// DELETE: Soft delete profile (ADMIN only)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuthInRoute, requireRoleInRoute, jsonError } from '@/lib/api/auth'
import { ProfileUpdateSchema } from '@/lib/api/validation'

// GET: Fetch a profile by ID
export async function GET(req: NextRequest) {
  const { session, status, error } = await requireAuthInRoute()
  if (status) return jsonError(error, status)

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return jsonError('Missing id parameter', 400)
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
    })

    if (!profile) {
      return jsonError('Profile not found', 404)
    }

    return NextResponse.json({ user: profile })
  } catch (err) {
    return jsonError('Failed to fetch profile', 500)
  }
}

// POST: Update current user's profile
// Only the user can update their own profile
export async function POST(req: NextRequest) {
  const { session, status, error } = await requireAuthInRoute()
  if (status || !session) return jsonError(error || 'Unauthorized', status || 401)

  try {
    const body = await req.json()
    const validated = ProfileUpdateSchema.parse(body)

    // Update only the authenticated user's profile
    const profile = await prisma.profile.update({
      where: { id: session.id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ user: profile })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return jsonError('Invalid input', 400)
    }
    if (err.code === 'P2002') {
      return jsonError('Username already taken', 409)
    }
    return jsonError('Failed to update profile', 500)
  }
}

// PUT: Update any profile (ADMIN only)
// ADMIN can update any user's profile
export async function PUT(req: NextRequest) {
  const { session, status, error } = await requireRoleInRoute('ADMIN')
  if (status || !session) return jsonError(error || 'Unauthorized', status || 401)

  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return jsonError('Missing id field', 400)
    }

    const validated = ProfileUpdateSchema.parse(data)

    // ADMIN can update any profile
    const profile = await prisma.profile.update({
      where: { id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ user: profile })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return jsonError('Invalid input', 400)
    }
    if (err.code === 'P2002') {
      return jsonError('Username already taken', 409)
    }
    if (err.code === 'P2025') {
      return jsonError('Profile not found', 404)
    }
    return jsonError('Failed to update profile', 500)
  }
}

// DELETE: Soft delete a profile (ADMIN only)
// Sets deleted = true instead of hard delete to preserve referential integrity
export async function DELETE(req: NextRequest) {
  const { session, status, error } = await requireRoleInRoute('ADMIN')
  if (status || !session) return jsonError(error || 'Unauthorized', status || 401)

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return jsonError('Missing id parameter', 400)
  }

  try {
    // Soft delete: set deleted = true
    const profile = await prisma.profile.update({
      where: { id },
      data: {
        deleted: true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ user: profile })
  } catch (err: any) {
    if (err.code === 'P2025') {
      return jsonError('Profile not found', 404)
    }
    return jsonError('Failed to delete profile', 500)
  }
}
