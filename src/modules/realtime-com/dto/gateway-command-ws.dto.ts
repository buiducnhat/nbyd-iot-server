import { IsString } from 'class-validator';

export class GatewayCommandWsDto {
  @IsString()
  projectId: string;

  @IsString()
  gatewayId: string;

  @IsString()
  datastreamId: string;

  @IsString()
  value: string;
}
