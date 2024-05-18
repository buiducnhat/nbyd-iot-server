import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { ZDevicePin } from '@modules/devices/dto/z-device.enum';

export class PairZDeviceDto {
  @IsString()
  projectId: string;

  @IsString()
  gatewayId: string;

  @IsString()
  name: string;

  @IsEnum(ZDevicePin)
  pin: ZDevicePin;

  @IsOptional()
  @IsString()
  color?: string;

  @IsBoolean()
  value: boolean;
}

export class PairZDeviceResultDto {
  @IsString()
  mac: string;
}
