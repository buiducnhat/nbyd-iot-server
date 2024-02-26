/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Datastream` table. All the data in the column will be lost.
  - You are about to drop the column `pinMode` on the `Datastream` table. All the data in the column will be lost.
  - You are about to drop the column `pinType` on the `Datastream` table. All the data in the column will be lost.
  - Added the required column `type` to the `Datastream` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EDatastreamType" AS ENUM ('DIGITAL', 'ANALOG', 'VIRTUAL', 'ZIGBEE');

-- CreateEnum
CREATE TYPE "EDatastreamMode" AS ENUM ('INPUT', 'OUTPUT', 'INPUT_PULLUP', 'INPUT_PULLDOWN');

-- AlterEnum
ALTER TYPE "EDatastreamDataType" ADD VALUE 'JSON';

-- AlterTable
ALTER TABLE "Datastream" DROP COLUMN "deletedAt",
DROP COLUMN "pinMode",
DROP COLUMN "pinType",
ADD COLUMN     "mode" "EDatastreamMode",
ADD COLUMN     "type" "EDatastreamType" NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "location" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[];

-- DropEnum
DROP TYPE "EDatastreamPinMode";

-- DropEnum
DROP TYPE "EDatastreamPinType";
