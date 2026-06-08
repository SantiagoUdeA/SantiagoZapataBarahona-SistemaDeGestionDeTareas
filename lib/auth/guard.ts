// Authentication and authorization guards for server components and routes
// These functions enforce access control by checking Supabase auth + Prisma role

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Enum_Role } from '@/app/generated/prisma';
import prisma from '@/lib/prisma';

// Requires user to be authenticated
// Verifies Supabase session exists, otherwise redirects to login
// Returns the authenticated user from Supabase
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

// Requires user to have a specific role (ADMIN or USER)
// Fetches session + verifies role matches the requested role
// Redirects to dashboard if role doesn't match (403 equivalent)
export async function requireRole(role: Enum_Role) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  if (session.role !== role) {
    redirect('/dashboard');
  }

  return session;
}

// Safely requires ADMIN session with error tuple pattern
// Returns { error } or { session } instead of redirecting
// Useful for Server Actions that need to return error messages to the client
export async function requireAdminSession(): Promise<{ error: 'No autorizado' } | { error: 'Requiere rol ADMIN' } | { session: NonNullable<Awaited<ReturnType<typeof getSession>>> }> {
  const session = await getSession();
  if (!session) return { error: 'No autorizado' as const };
  if (session.role !== 'ADMIN') return { error: 'Requiere rol ADMIN' as const };
  return { session };
}

// Fetches the current user session by combining Supabase auth + Prisma profile
// This ensures role information is always up-to-date with the database
// Returns null if user is not authenticated or profile doesn't exist
export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch profile from Prisma to get role and metadata
  // Profile is created automatically on signup via database trigger
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    return null;
  }

  // Return normalized session object with essential fields
  return {
    id: profile.id,
    email: user.email!,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  };
}