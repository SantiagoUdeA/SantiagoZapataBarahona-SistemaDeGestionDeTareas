-- ============================================================
-- Migration: Add kanban board columns + task movements audit log
-- Run this SQL directly in Supabase SQL Editor
-- ============================================================

-- Step 1: Create board_columns table
CREATE TABLE "board_columns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_columns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "board_columns_projectId_position_idx" ON "board_columns"("projectId", "position");

ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 2: Seed 3 default columns for every existing project
--   position 0 = Pendiente  (maps from PENDING)
--   position 1 = En progreso (maps from IN_PROGRESS)
--   position 2 = Completado  (maps from COMPLETED, isDone=true)
INSERT INTO "board_columns" ("id", "projectId", "name", "position", "isDone", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    p."id",
    col."name",
    col."position",
    col."isDone",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "projects" p
CROSS JOIN (VALUES
    ('Pendiente',   0, false),
    ('En progreso', 1, false),
    ('Completado',  2, true)
) AS col("name", "position", "isDone");

-- Step 3: Add columnId (nullable first) and position to tasks
ALTER TABLE "tasks"
    ADD COLUMN "columnId" UUID,
    ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Step 4: Backfill columnId — map each task's status to its project's matching column
UPDATE "tasks" t
SET "columnId" = bc."id"
FROM "board_columns" bc
WHERE bc."projectId" = t."projectId"
  AND bc."name" = CASE t."status"
      WHEN 'PENDING'     THEN 'Pendiente'
      WHEN 'IN_PROGRESS' THEN 'En progreso'
      WHEN 'COMPLETED'   THEN 'Completado'
  END;

-- Step 5: Backfill position — sequential per (columnId) ordered by createdAt
WITH ranked AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "columnId"
            ORDER BY "createdAt"
        ) - 1 AS rn
    FROM "tasks"
)
UPDATE "tasks" t
SET "position" = ranked.rn
FROM ranked
WHERE t."id" = ranked."id";

-- Step 6: Make columnId NOT NULL and add FK (Restrict so columns with tasks can't be deleted)
ALTER TABLE "tasks" ALTER COLUMN "columnId" SET NOT NULL;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_columnId_fkey"
    FOREIGN KEY ("columnId") REFERENCES "board_columns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "tasks_columnId_position_idx" ON "tasks"("columnId", "position");

-- Step 7: Drop the old status column and enum
ALTER TABLE "tasks" DROP COLUMN "status";

DROP TYPE IF EXISTS "Enum_TaskStatus";

-- Step 8: Create Enum_MovementType
CREATE TYPE "Enum_MovementType" AS ENUM (
    'CREATED',
    'UPDATED',
    'COLUMN_CHANGED',
    'REORDERED',
    'DELETED'
);

-- Step 9: Create task_movements audit log table
CREATE TABLE "task_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taskId" UUID,
    "projectId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "type" "Enum_MovementType" NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "fromColumn" TEXT,
    "toColumn" TEXT,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "task_movements_projectId_createdAt_idx" ON "task_movements"("projectId", "createdAt");
CREATE INDEX "task_movements_actorId_idx" ON "task_movements"("actorId");
CREATE INDEX "task_movements_type_idx" ON "task_movements"("type");

-- taskId: SetNull when task is deleted (log survives)
ALTER TABLE "task_movements" ADD CONSTRAINT "task_movements_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- projectId: Cascade when project is deleted (movements die with the project)
ALTER TABLE "task_movements" ADD CONSTRAINT "task_movements_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- actorId: Restrict (never cascade-delete movements when profile is soft-deleted)
ALTER TABLE "task_movements" ADD CONSTRAINT "task_movements_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
