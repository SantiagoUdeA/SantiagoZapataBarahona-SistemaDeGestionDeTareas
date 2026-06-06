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
    progress integer NOT NULL DEFAULT 0,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,
    CONSTRAINT projects_createdBy_fkey FOREIGN KEY ("createdBy") REFERENCES public.profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX projects_createdBy_idx ON public.projects("createdBy");

-- CreateTable project_members
CREATE TABLE public.project_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "projectId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "joinedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_members_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT project_members_userId_fkey FOREIGN KEY ("userId") REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX project_members_projectId_userId_key ON public.project_members("projectId", "userId");
CREATE INDEX project_members_projectId_idx ON public.project_members("projectId");
CREATE INDEX project_members_userId_idx ON public.project_members("userId");
