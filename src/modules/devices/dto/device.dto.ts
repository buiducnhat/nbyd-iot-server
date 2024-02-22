import {
  EDeviceConnection,
  EDeviceHardware,
  EDeviceStatus,
} from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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

  @IsEnum(EDeviceStatus)
  status: EDeviceStatus;

  @IsEnum(EDeviceHardware)
  hardware: EDeviceHardware;

  @IsEnum(EDeviceConnection)
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
}
