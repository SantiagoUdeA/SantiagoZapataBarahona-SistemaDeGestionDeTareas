import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Enum_Role } from '@/app/generated/prisma/enums';
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== role) {
    redirect('/dashboard');
  }

  return user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.profile?.name ?? user.email,
    image: profile.profile?.image ?? user.user_metadata?.avatar_url ?? null,
    role: profile.role,
  };
}