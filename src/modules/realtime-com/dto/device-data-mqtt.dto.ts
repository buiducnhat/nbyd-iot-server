import { IsString } from 'class-validator';

export class DeviceDataMqttDto {
  @IsString()
  datastreamId: string;

  @IsString()
  value: string;
}
