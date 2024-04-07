import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  Device,
  EDeviceConnection,
  EDeviceHardware,
  EDeviceStatus,
} from '@prisma/client';

export class DeviceBasicDto implements Partial<Device> {
  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  projectId: string;

  @ApiProperty({ enum: EDeviceStatus })
  status: EDeviceStatus;

  @ApiProperty({ enum: EDeviceHardware })
  hardware: EDeviceHardware;

  @ApiProperty({ enum: EDeviceConnection })
  connection: EDeviceConnection;

  @ApiProperty()
  authToken: string;

  @ApiPropertyOptional()
  authTokenExpiry?: Date;

  @ApiPropertyOptional()
  imageFileId?: string;

  @ApiPropertyOptional()
  imageFileUrl?: string;

  @ApiPropertyOptional()
  lastOnline?: Date;
}
