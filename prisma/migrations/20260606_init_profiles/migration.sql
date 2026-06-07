-- DropForeignKey existing constraints (if they exist)
-- This migration starts fresh; old tables are dropped

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public."ProjectMember" CASCADE;
DROP TABLE IF EXISTS public."Project" CASCADE;
DROP TABLE IF EXISTS public."Profile" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;

-- Drop old migrations' tables if they exist
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;

DROP TYPE IF EXISTS public."Enum_Role";
DROP TYPE IF EXISTS "Enum_OrderStatus";
DROP TYPE IF EXISTS "Enum_PaymentMethod";
DROP TYPE IF EXISTS "Enum_PaymentStatus";

-- CreateEnum
CREATE TYPE public."Enum_Role" AS ENUM ('ADMIN', 'USER');

CREATE TYPE public."Enum_TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable profiles
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    username text,
    "fullName" text,
    "avatarUrl" text,
    bio text,
    role public."Enum_Role" NOT NULL DEFAULT 'USER',
    enabled boolean NOT NULL DEFAULT true,
    deleted boolean NOT NULL DEFAULT false,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX profiles_username_key ON public.profiles(username);

-- CreateTable projects
CREATE TABLE public.projects (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,
    CONSTRAINT projects_createdBy_fkey FOREIGN KEY ("createdBy") REFERENCES public.profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX projects_createdBy_idx ON public.projects("createdBy");

-- CreateTable tasks
CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    status public."Enum_TaskStatus" NOT NULL DEFAULT 'PENDING',
    "projectId" uuid NOT NULL,
    "assigneeId" uuid NOT NULL,
    "completedAt" timestamp(3),
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,
    CONSTRAINT tasks_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT tasks_assigneeId_fkey FOREIGN KEY ("assigneeId") REFERENCES public.profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX tasks_projectId_idx ON public.tasks("projectId");
CREATE INDEX tasks_assigneeId_idx ON public.tasks("assigneeId");
