import { ZDevicePin } from '@modules/devices/dto/z-device.enum';

export class PairZDeviceDto {
  projectId: string;
  gatewayId: string;
  name: string;
  pin: ZDevicePin;
  color?: string;
  value: boolean;
}

export class PairZDeviceResultDto {
  mac: string;
}
