import { ApiProperty } from '@nestjs/swagger';

import { EGatewayConnection, EGatewayHardware } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGatewayDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ enum: EGatewayHardware })
  @IsEnum(EGatewayHardware)
  hardware: EGatewayHardware;

  @ApiProperty({ enum: EGatewayConnection })
  @IsEnum(EGatewayConnection)
  connection: EGatewayConnection;
}
