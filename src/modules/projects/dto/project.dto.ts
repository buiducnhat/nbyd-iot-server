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

import { GatewayBasicDto } from '@modules/gateways/dto/gateway.dto';

export class ProjectBasicDto implements Partial<Project> {
  @IsInt()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  imageFileId?: string;

  @IsOptional()
  imageFileUrl?: string;

  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  _count: {
    gateways: number;
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

  gateways: GatewayBasicDto[];
}
