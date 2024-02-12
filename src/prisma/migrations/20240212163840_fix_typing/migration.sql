/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "proj_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_imageFileId_fkey";

-- DropForeignKey
ALTER TABLE "proj_devices" DROP CONSTRAINT "proj_devices_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_userId_fkey";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "project_members";

-- DropEnum
DROP TYPE "project_status";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "proj_status" NOT NULL,
    "config" JSONB NOT NULL,
    "imageFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_members" (
    "projectId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "proj_mem_role" NOT NULL,

    CONSTRAINT "proj_members_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_imageFileId_key" ON "projects"("imageFileId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_members" ADD CONSTRAINT "proj_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_members" ADD CONSTRAINT "proj_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_devices" ADD CONSTRAINT "proj_devices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
