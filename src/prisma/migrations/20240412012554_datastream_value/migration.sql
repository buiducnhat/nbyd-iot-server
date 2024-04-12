/*
  Warnings:

  - You are about to drop the `DatastreamHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DatastreamHistory" DROP CONSTRAINT "DatastreamHistory_datastreamId_fkey";

-- DropTable
DROP TABLE "DatastreamHistory";

-- CreateTable
CREATE TABLE "DatastreamValue" (
    "datastreamId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "datastream_value_created_at_idx" ON "DatastreamValue"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DatastreamValue_datastreamId_value_createdAt_key" ON "DatastreamValue"("datastreamId", "value", "createdAt");

-- AddForeignKey
ALTER TABLE "DatastreamValue" ADD CONSTRAINT "DatastreamValue_datastreamId_fkey" FOREIGN KEY ("datastreamId") REFERENCES "Datastream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
