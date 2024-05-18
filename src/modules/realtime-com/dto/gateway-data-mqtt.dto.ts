import { IsString } from 'class-validator';

export class GatewayDataMqttDto {
  @IsString()
  projectId: string;

  @IsString()
  datastreamId: string;

  @IsString()
  value: string;
}
