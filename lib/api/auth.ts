import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/guard'

export async function requireAuthInRoute() {
  const session = await getSession()
  if (!session) {
    return {
      error: 'Unauthorized',
      status: 401,
    }
  }
  return { session, status: null }
}

export async function requireRoleInRoute(requiredRole: 'ADMIN' | 'USER') {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }
  if (requiredRole === 'ADMIN' && session.role !== 'ADMIN') {
    return { error: 'Forbidden', status: 403 }
  }
  return { session, status: null }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}
