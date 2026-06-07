import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Enum_Role } from '@/app/generated/prisma';
import prisma from '@/lib/prisma';

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireRole(role: Enum_Role) {
  const session = await getSession();
  if (!session || session.role !== role) {
    redirect('/login');
  }

  return session;
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: user.email!,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  };
}