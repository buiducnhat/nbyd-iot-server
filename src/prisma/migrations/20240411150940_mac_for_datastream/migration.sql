/*
  Warnings:

  - You are about to drop the column `lastValue` on the `Datastream` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mac]` on the table `Datastream` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Datastream" DROP COLUMN "lastValue",
ADD COLUMN     "mac" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "Datastream_mac_key" ON "Datastream"("mac");
