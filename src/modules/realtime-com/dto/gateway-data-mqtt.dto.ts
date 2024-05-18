import { IsString } from 'class-validator';

export class GatewayDataMqttDto {
  @IsString()
  projectId: string;

  @IsString()
  deviceId: string;

  @IsString()
  value: string;
}
