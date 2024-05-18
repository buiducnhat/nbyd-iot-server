import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  EGatewayConnection,
  EGatewayHardware,
  EGatewayStatus,
  Gateway,
} from '@prisma/client';

export class GatewayBasicDto implements Partial<Gateway> {
  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: 'd1e2d3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6' })
  projectId: string;

  @ApiProperty({ enum: EGatewayStatus })
  status: EGatewayStatus;

  @ApiProperty({ enum: EGatewayHardware })
  hardware: EGatewayHardware;

  @ApiProperty({ enum: EGatewayConnection })
  connection: EGatewayConnection;

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
