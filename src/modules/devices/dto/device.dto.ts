import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EDeviceDataType, EDeviceMode, EDeviceType } from '@prisma/client';

export class DeviceBasicDto {
  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  gatewayId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  iconId?: number;

  @ApiPropertyOptional()
  color?: string;

  @ApiProperty({ enum: EDeviceType })
  type: EDeviceType;

  @ApiProperty({ example: '00:11:22:33:44:55' })
  mac?: string;

  @ApiProperty({ example: 'D0' })
  pin?: string;

  @ApiPropertyOptional({ enum: EDeviceMode })
  mode?: EDeviceMode;

  @ApiPropertyOptional({ enum: EDeviceDataType })
  dataType?: EDeviceDataType;

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

export class DeviceValueDto {
  @ApiProperty()
  value: string;

  @ApiProperty()
  createdAt: Date;
}

export class DeviceDetailDto extends DeviceBasicDto {
  @ApiProperty()
  values: DeviceValueDto[];
}
