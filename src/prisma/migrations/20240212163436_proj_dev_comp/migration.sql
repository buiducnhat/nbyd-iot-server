-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "proj_mem_role" AS ENUM ('OWNER', 'DEVELOPER', 'GUEST');

-- CreateEnum
CREATE TYPE "proj_dev_status" AS ENUM ('ONLINE', 'OFFLINE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "proj_dev_hardware" AS ENUM ('ESP8266', 'ESP32', 'RASPBERRY_PI');

-- CreateEnum
CREATE TYPE "proj_dev_connection" AS ENUM ('WIFI', 'ETHERNET');

-- CreateEnum
CREATE TYPE "proj_dev_comp_pin_type" AS ENUM ('DIGITAL', 'ANALOG', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "proj_dev_comp_pin_mode" AS ENUM ('INPUT', 'OUTPUT', 'INPUT_PULLUP', 'INPUT_PULLDOWN', 'OUTPUT_OPEN_DRAIN', 'OUTPUT_OPEN_SOURCE');

-- CreateEnum
CREATE TYPE "proj_dev_comp_data_type" AS ENUM ('BOOLEAN', 'INTEGER', 'FLOAT', 'STRING');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "project_status" NOT NULL,
    "config" JSONB NOT NULL,
    "imageFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "projectId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "proj_mem_role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "proj_devices" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "imageFileId" TEXT,
    "config" JSONB NOT NULL,
    "status" "proj_dev_status" NOT NULL DEFAULT 'OFFLINE',
    "hardware" "proj_dev_hardware" NOT NULL,
    "connection" "proj_dev_connection" NOT NULL,
    "lastOnline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "proj_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_dev_components" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "config" JSONB NOT NULL,
    "pinType" "proj_dev_comp_pin_type" NOT NULL,
    "pinMode" "proj_dev_comp_pin_mode" NOT NULL,
    "dataType" "proj_dev_comp_data_type" NOT NULL,
    "minVal" DOUBLE PRECISION,
    "maxVal" DOUBLE PRECISION,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "proj_dev_components_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_imageFileId_key" ON "Project"("imageFileId");

-- CreateIndex
CREATE UNIQUE INDEX "proj_devices_imageFileId_key" ON "proj_devices"("imageFileId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_devices" ADD CONSTRAINT "proj_devices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_devices" ADD CONSTRAINT "proj_devices_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_dev_components" ADD CONSTRAINT "proj_dev_components_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "proj_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
