/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `UserExternal` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `UserLogin` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `UserSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "UserExternal" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "UserLogin" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "deletedAt";
