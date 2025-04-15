-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT timezone('utc', now());
