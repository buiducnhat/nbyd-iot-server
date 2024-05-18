import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { ZDatastreamPin } from '@modules/datastreams/dto/z-datastream.enum';

export class PairZDatastreamDto {
  @IsString()
  projectId: string;

  @IsString()
  deviceId: string;

  @IsString()
  name: string;

  @IsEnum(ZDatastreamPin)
  pin: ZDatastreamPin;

  @IsOptional()
  @IsString()
  color?: string;

  @IsBoolean()
  value: boolean;
}

export class PairZDatastreamResultDto {
  @IsString()
  mac: string;
}
