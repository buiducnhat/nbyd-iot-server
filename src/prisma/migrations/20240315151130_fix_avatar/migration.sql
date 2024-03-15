/*
  Warnings:

  - You are about to drop the column `avatarimageFileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avatarimageFileUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarimageFileId",
DROP COLUMN "avatarimageFileUrl",
ADD COLUMN     "avatarImageFileId" TEXT,
ADD COLUMN     "avatarImageFileUrl" TEXT;
