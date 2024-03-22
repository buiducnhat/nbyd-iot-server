import { IsString } from 'class-validator';

export class DeviceCommandWsDto {
  @IsString()
  projectId: string;

  @IsString()
  deviceId: string;

  @IsString()
  datastreamId: string;

  @IsString()
  value: string;
}
