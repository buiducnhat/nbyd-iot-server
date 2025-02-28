import { EDeviceDataType, EDeviceMode } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsInt()
  iconId?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @MaxLength(10)
  pin?: string;

  @IsOptional()
  @IsEnum(EDeviceMode)
  mode?: EDeviceMode;

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
