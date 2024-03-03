import { ApiProperty } from '@nestjs/swagger';

import { EProjectStatus, Prisma, Project } from '@prisma/client';
import {
  IsDateString,
  IsInt,
  IsJSON,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { DeviceBasicDto } from '@modules/devices/dto/device.dto';
import { FileBasicDto } from '@modules/files/dto/file.dto';

export class ProjectBasicDto implements Partial<Project> {
  @IsInt()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ enum: EProjectStatus })
  status?: EProjectStatus;

  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    minLength: 2,
    maxLength: 2,
  })
  location?: number[];

  @IsOptional()
  @IsObject()
  imageFile: FileBasicDto | null;

  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  _count: {
    devices: number;
  };
}

export class ProjectDetailDto extends ProjectBasicDto {
  @IsOptional()
  @IsJSON()
  metaData: Prisma.JsonValue | null;

  @IsOptional()
  @IsJSON()
  webDashboard: Prisma.JsonValue | null;

  @IsOptional()
  @IsJSON()
  mobileDashboard: Prisma.JsonValue | null;

  @IsOptional()
  @IsObject()
  imageFile: FileBasicDto | null;

  devices: DeviceBasicDto[];
}
