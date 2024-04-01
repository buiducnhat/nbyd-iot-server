/*
  Warnings:

  - The values [BOOLEAN] on the enum `EDatastreamDataType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `enabled` on the `Datastream` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EDatastreamDataType_new" AS ENUM ('INTEGER', 'FLOAT', 'STRING', 'JSON');
ALTER TABLE "Datastream" ALTER COLUMN "dataType" TYPE "EDatastreamDataType_new" USING ("dataType"::text::"EDatastreamDataType_new");
ALTER TYPE "EDatastreamDataType" RENAME TO "EDatastreamDataType_old";
ALTER TYPE "EDatastreamDataType_new" RENAME TO "EDatastreamDataType";
DROP TYPE "EDatastreamDataType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Datastream" DROP COLUMN "enabled",
ADD COLUMN     "decimalPlaces" INTEGER DEFAULT 2,
ALTER COLUMN "iconId" DROP NOT NULL,
ALTER COLUMN "iconId" DROP DEFAULT,
ALTER COLUMN "color" DROP NOT NULL,
ALTER COLUMN "color" DROP DEFAULT,
ALTER COLUMN "color" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "body",
DROP COLUMN "title";

-- CreateIndex
CREATE INDEX "Datastream_deviceId_idx" ON "Datastream"("deviceId");

-- CreateIndex
CREATE INDEX "Notification_userId_type_isRead_idx" ON "Notification"("userId", "type", "isRead");
