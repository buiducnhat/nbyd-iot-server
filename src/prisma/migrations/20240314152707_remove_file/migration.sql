/*
  Warnings:

  - You are about to drop the column `imageFileId` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `imageFileId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `avatarFileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_imageFileId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_imageFileId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_avatarFileId_fkey";

-- DropIndex
DROP INDEX "Device_imageFileId_key";

-- DropIndex
DROP INDEX "Project_imageFileId_key";

-- DropIndex
DROP INDEX "User_avatarFileId_key";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "imageFileId",
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "imageFileId",
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarFileId",
ADD COLUMN     "avatarImageId" TEXT,
ADD COLUMN     "avatarImageUrl" TEXT;

-- DropTable
DROP TABLE "File";

-- CreateIndex
CREATE UNIQUE INDEX "Device_imageId_key" ON "Device"("imageId");
