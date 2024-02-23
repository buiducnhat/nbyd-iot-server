import {
  EDatastreamDataType,
  EDatastreamPinMode,
  EDatastreamPinType,
} from '@prisma/client';
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

export class CreateDatastreamDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsInt()
  iconId?: number;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsEnum(EDatastreamPinType)
  pinType: EDatastreamPinType;

  @IsOptional()
  @IsEnum(EDatastreamPinMode)
  pinMode?: EDatastreamPinMode;

  @IsOptional()
  @IsEnum(EDatastreamDataType)
  dataType?: EDatastreamDataType;

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
