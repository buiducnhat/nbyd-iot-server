import { IsString } from 'class-validator';

export class DeviceCommandWsDto {
  @IsString()
  datastreamId: string;

  @IsString()
  value: string;
}
