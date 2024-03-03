import { ApiProperty } from '@nestjs/swagger';

import {
  EDeviceConnection,
  EDeviceHardware,
  EDeviceStatus,
} from '@prisma/client';
import {
  IsDate,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { DatastreamBasicDto } from '@modules/datastreams/dto/datastream.dto';
import { FileBasicDto } from '@modules/files/dto/file.dto';

export class DeviceBasicDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  projectId: string;

  @ApiProperty({ enum: EDeviceStatus })
  status: EDeviceStatus;

  @ApiProperty({ enum: EDeviceHardware })
  hardware: EDeviceHardware;

  @ApiProperty({ enum: EDeviceConnection })
  connection: EDeviceConnection;

  @IsString()
  authToken: string;

  @IsOptional()
  @IsDate()
  authTokenExpiry?: Date;

  @IsOptional()
  @IsString()
  imageFileId?: string;

  @IsOptional()
  @IsObject()
  imageFile?: FileBasicDto;

  @IsOptional()
  @IsDate()
  lastOnline?: Date;

  datastreams: DatastreamBasicDto[];
}
