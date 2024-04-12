import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ZDatastreamPin } from '@modules/datastreams/dto/z-datastream.enum';

export class PairZDatastreamDto {
  @IsString()
  projectId: string;

  @IsString()
  deviceId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  mac?: string;

  @IsEnum(ZDatastreamPin)
  pin: ZDatastreamPin;
}
