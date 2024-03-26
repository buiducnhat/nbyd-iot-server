/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace PrismaJson {
    type TDeviceMetaData = {
      ipAddress: string;
      macAddress: string;
    };
  }
}

export {};
