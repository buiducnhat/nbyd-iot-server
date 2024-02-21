import { EDeviceConnection, EDeviceHardware } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsEnum(EDeviceHardware)
  hardware: EDeviceHardware;

  @IsEnum(EDeviceConnection)
  connection: EDeviceConnection;
}
