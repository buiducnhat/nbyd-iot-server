import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  EDatastreamDataType,
  EDatastreamMode,
  EDatastreamType,
} from '@prisma/client';
import {
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

  @ApiProperty({ enum: EDatastreamType })
  type: EDatastreamType;

  @IsOptional()
  @ApiPropertyOptional({ enum: EDatastreamMode })
  mode?: EDatastreamMode;

  @ApiPropertyOptional({ enum: EDatastreamDataType })
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
