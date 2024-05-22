-- DropForeignKey
ALTER TABLE "DeviceValue" DROP CONSTRAINT "DeviceValue_deviceId_fkey";

-- AddForeignKey
ALTER TABLE "DeviceValue" ADD CONSTRAINT "DeviceValue_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
