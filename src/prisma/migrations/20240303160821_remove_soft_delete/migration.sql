/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "deletedAt";
