/*
  Warnings:

  - You are about to drop the column `imageId` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `avatarImageId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avatarImageUrl` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Device_imageId_key";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "imageId",
DROP COLUMN "imageUrl",
ADD COLUMN     "imageFileId" TEXT,
ADD COLUMN     "imageFileUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "imageId",
DROP COLUMN "imageUrl",
ADD COLUMN     "imageFileId" TEXT,
ADD COLUMN     "imageFileUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarImageId",
DROP COLUMN "avatarImageUrl",
ADD COLUMN     "avatarimageFileId" TEXT,
ADD COLUMN     "avatarimageFileUrl" TEXT;
