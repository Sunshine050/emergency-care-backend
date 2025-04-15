-- AlterTable
ALTER TABLE "SOSAlert" ALTER COLUMN "severityGrade" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT timezone('utc', now());
