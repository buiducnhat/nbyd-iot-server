import { IsString } from 'class-validator';

export class GatewayCommandWsDto {
  @IsString()
  projectId: string;

  @IsString()
  gatewayId: string;

  @IsString()
  deviceId: string;

  @IsString()
  value: string;
}
