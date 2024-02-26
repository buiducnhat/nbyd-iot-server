/*
  Warnings:

  - The `status` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EProjectStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "status",
ADD COLUMN     "status" "EProjectStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "EProjStatus";
