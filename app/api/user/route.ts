import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuthInRoute, requireRoleInRoute, jsonError } from '@/lib/api/auth'
import { ProfileUpdateSchema } from '@/lib/api/validation'

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

export async function POST(req: NextRequest) {
  const { session, status, error } = await requireAuthInRoute()
  if (status || !session) return jsonError(error || 'Unauthorized', status || 401)

  try {
    const body = await req.json()
    const validated = ProfileUpdateSchema.parse(body)

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

export async function DELETE(req: NextRequest) {
  const { session, status, error } = await requireRoleInRoute('ADMIN')
  if (status || !session) return jsonError(error || 'Unauthorized', status || 401)

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return jsonError('Missing id parameter', 400)
  }

  try {
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
