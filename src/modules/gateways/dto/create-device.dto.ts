import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EDeviceDataType, EDeviceMode, EDeviceType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsInt()
  iconId?: number;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({ enum: EDeviceType })
  @IsEnum(EDeviceType)
  type: EDeviceType;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pin?: string;

  @ApiPropertyOptional({ enum: EDeviceMode })
  @IsOptional()
  @IsEnum(EDeviceMode)
  mode?: EDeviceMode;

  @ApiPropertyOptional({ enum: EDeviceDataType })
  @IsOptional()
  @IsEnum(EDeviceDataType)
  dataType?: EDeviceDataType;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @IsOptional()
  @IsBoolean()
  enabledHistory?: boolean;
}
