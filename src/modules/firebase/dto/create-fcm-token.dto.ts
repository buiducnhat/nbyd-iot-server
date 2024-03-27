import { ApiProperty } from '@nestjs/swagger';

import { EAppType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateFcmTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsEnum(EAppType)
  @ApiProperty({ enum: EAppType })
  appType: EAppType;
}
