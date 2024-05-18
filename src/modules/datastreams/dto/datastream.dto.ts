import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  EDatastreamDataType,
  EDatastreamMode,
  EDatastreamType,
} from '@prisma/client';

export class DatastreamBasicDto {
  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  deviceId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  iconId?: number;

  @ApiPropertyOptional()
  color?: string;

  @ApiProperty({ enum: EDatastreamType })
  type: EDatastreamType;

  @ApiProperty({ example: '00:11:22:33:44:55' })
  mac?: string;

  @ApiProperty({ example: 'D0' })
  pin?: string;

  @ApiPropertyOptional({ enum: EDatastreamMode })
  mode?: EDatastreamMode;

  @ApiPropertyOptional({ enum: EDatastreamDataType })
  dataType?: EDatastreamDataType;

  @ApiPropertyOptional()
  minValue?: number;

  @ApiPropertyOptional()
  maxValue?: number;

  @ApiPropertyOptional()
  defaultValue?: string;

  @ApiPropertyOptional()
  unit?: string;

  @ApiPropertyOptional()
  description?: string;
}

export class DatastreamValueDto {
  @ApiProperty()
  value: string;

  @ApiProperty()
  createdAt: Date;
}

export class DatastreamDetailDto extends DatastreamBasicDto {
  @ApiProperty()
  values: DatastreamValueDto[];
}
