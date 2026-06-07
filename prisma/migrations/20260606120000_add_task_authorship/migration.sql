-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "createdById" UUID NOT NULL,
ADD COLUMN     "completedById" UUID;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
