import {
  EDatastreamDataType,
  EDatastreamPinMode,
  EDatastreamPinType,
} from '@prisma/client';
import {
  IsEnum,
  IsHexColor,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class DatastreamBasicDto {
  @IsUUID()
  id: string;

  @IsUUID()
  deviceId: string;

  @IsString()
  name: string;

  @IsInt()
  iconId: number;

  @IsHexColor()
  color: string;

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
  unit?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
