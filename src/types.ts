/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace PrismaJson {
    type TGatewayMetaData = {
      ipAddress: string;
      macAddress: string;
    };
  }
}

export {};
