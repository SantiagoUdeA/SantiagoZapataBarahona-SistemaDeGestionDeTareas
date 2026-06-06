-- ============================================================================
-- Row-Level Security (RLS) Policies
-- Execute this SQL in Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PROFILES Table
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but cannot change role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Cannot escalate role — role must remain the same
      role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ADMINs can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- ADMINs can update any profile (including role)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- Prevent direct deletion (use soft-delete via app layer with deleted: true)
CREATE POLICY "No deletion of profiles"
  ON public.profiles FOR DELETE
  USING (false);

-- ============================================================================
-- PROJECTS Table
-- ============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can read projects they own
CREATE POLICY "Users can read own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = "createdBy");

-- Users can read projects they are members of
CREATE POLICY "Members can read projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE "projectId" = projects.id AND "userId" = auth.uid()
    )
  );

-- ADMINs can read all projects
CREATE POLICY "Admins can read all projects"
  ON public.projects FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- Only owner can update
CREATE POLICY "Only owner can update project"
  ON public.projects FOR UPDATE
  USING (auth.uid() = "createdBy");

-- Only owner can delete
CREATE POLICY "Only owner can delete project"
  ON public.projects FOR DELETE
  USING (auth.uid() = "createdBy");

-- ============================================================================
-- PROJECT_MEMBERS Table
-- ============================================================================

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Users can read their own memberships
CREATE POLICY "Users can read own memberships"
  ON public.project_members FOR SELECT
  USING (auth.uid() = "userId");

-- Project owner can see all members of their projects
CREATE POLICY "Owner can read project members"
  ON public.project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members."projectId" AND p."createdBy" = auth.uid()
    )
  );

-- ADMINs can see all memberships
CREATE POLICY "Admins can read all memberships"
  ON public.project_members FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- ============================================================================
-- NOTES:
--
-- 1. RLS policies protect against direct database access and future PostgREST usage
--    Current app uses Prisma with direct Postgres connection (role=postgres), so these
--    policies will NOT block application queries. They enforce constraints at DB layer.
--
-- 2. Soft-delete pattern: deleted users are excluded by app logic (WHERE deleted = false)
--    RLS only prevents INSERT/UPDATE/DELETE via PostgREST, not via Prisma.
--
-- 3. Role elevation protection: users cannot UPDATE their own role field to 'ADMIN'
--
-- 4. If using Supabase JS client in the future, these policies will be enforced
-- ============================================================================
