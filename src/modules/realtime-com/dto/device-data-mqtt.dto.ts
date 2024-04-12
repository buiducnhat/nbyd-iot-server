import { IsString } from 'class-validator';

export class DeviceDataMqttDto {
  @IsString()
  projectId: string;

  @IsString()
  datastreamId: string;

  @IsString()
  value: string;
}
