-- CreateEnum
CREATE TYPE "ERole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "EGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EUserExternalProvider" AS ENUM ('GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "EProjectStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EProjectMemberRole" AS ENUM ('OWNER', 'DEVELOPER', 'GUEST');

-- CreateEnum
CREATE TYPE "EGatewayStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "EGatewayHardware" AS ENUM ('ESP8266', 'ESP32', 'RASPBERRY_PI');

-- CreateEnum
CREATE TYPE "EGatewayConnection" AS ENUM ('WIFI', 'ETHERNET');

-- CreateEnum
CREATE TYPE "EDeviceType" AS ENUM ('DIGITAL', 'ANALOG', 'VIRTUAL', 'ZIGBEE');

-- CreateEnum
CREATE TYPE "EDeviceMode" AS ENUM ('INPUT', 'OUTPUT', 'INPUT_PULLUP', 'INPUT_PULLDOWN');

-- CreateEnum
CREATE TYPE "EDeviceDataType" AS ENUM ('INTEGER', 'FLOAT', 'STRING', 'JSON');

-- CreateEnum
CREATE TYPE "EAppType" AS ENUM ('NBYD_WEBAPP', 'NBYD_MOBILEAPP');

-- CreateEnum
CREATE TYPE "ENotificationType" AS ENUM ('GENERAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50),
    "gender" "EGender",
    "dateOfBirth" TIMESTAMP(3),
    "avatarImageFileId" TEXT,
    "avatarImageFileUrl" TEXT,
    "phoneNumber" VARCHAR(15),
    "roles" "ERole"[] DEFAULT ARRAY['USER']::"ERole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLogin" (
    "userId" INTEGER NOT NULL,
    "username" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifyTokenAt" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "passwordResetToken" TEXT,
    "passwordResetTokenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLogin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "userIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExternal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "EUserExternalProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserExternal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "imageFileId" TEXT,
    "imageFileUrl" TEXT,
    "description" VARCHAR(255),
    "metaData" JSONB,
    "status" "EProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "location" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "webDashboard" JSONB,
    "mobileDashboard" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "projectId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "EProjectMemberRole" NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "Gateway" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "authToken" TEXT,
    "authTokenExpiry" TIMESTAMP(3),
    "imageFileId" TEXT,
    "imageFileUrl" TEXT,
    "status" "EGatewayStatus" NOT NULL DEFAULT 'OFFLINE',
    "hardware" "EGatewayHardware" NOT NULL,
    "connection" "EGatewayConnection" NOT NULL,
    "metaData" JSONB,
    "lastOnline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "iconId" INTEGER,
    "color" VARCHAR(20),
    "type" "EDeviceType" NOT NULL,
    "mac" VARCHAR(20),
    "pin" VARCHAR(50),
    "mode" "EDeviceMode",
    "dataType" "EDeviceDataType",
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "defaultValue" TEXT,
    "unit" VARCHAR(50),
    "enabledHistory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FcmToken" (
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "appType" "EAppType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FcmToken_pkey" PRIMARY KEY ("token","userId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "ENotificationType" NOT NULL DEFAULT 'GENERAL',
    "data" JSONB,
    "userId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceValue" (
    "deviceId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserExternal_userId_key" ON "UserExternal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Gateway_authToken_key" ON "Gateway"("authToken");

-- CreateIndex
CREATE UNIQUE INDEX "Device_mac_key" ON "Device"("mac");

-- CreateIndex
CREATE INDEX "Device_gatewayId_idx" ON "Device"("gatewayId");

-- CreateIndex
CREATE INDEX "Notification_userId_type_isRead_idx" ON "Notification"("userId", "type", "isRead");

-- CreateIndex
CREATE INDEX "device_value_created_at_idx" ON "DeviceValue"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceValue_deviceId_value_createdAt_key" ON "DeviceValue"("deviceId", "value", "createdAt");

-- AddForeignKey
ALTER TABLE "UserLogin" ADD CONSTRAINT "UserLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExternal" ADD CONSTRAINT "UserExternal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gateway" ADD CONSTRAINT "Gateway_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "Gateway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FcmToken" ADD CONSTRAINT "FcmToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceValue" ADD CONSTRAINT "DeviceValue_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
