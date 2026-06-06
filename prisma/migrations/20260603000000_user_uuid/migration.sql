-- Migration: User to UUID primary key
-- Drop Perfil FK and User table, recreate with UUID id

-- Drop foreign key from Perfil
ALTER TABLE "Perfil" DROP CONSTRAINT "Perfil_userId_fkey";

-- Drop Perfil table
DROP TABLE "Perfil";

-- Drop User table
DROP TABLE "User";

-- Recreate User with UUID primary key (Supabase Auth uses UUID)
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Enum_Role" NOT NULL DEFAULT 'USER',
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Recreate Perfil with UUID FK
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- Recreate unique index on User.email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Recreate unique index on Perfil.userId
CREATE UNIQUE INDEX "Perfil_userId_key" ON "Perfil"("userId");

-- Recreate FK for Perfil -> User
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;