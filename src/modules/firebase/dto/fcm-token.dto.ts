import { ApiProperty } from '@nestjs/swagger';

import { EAppType } from '@prisma/client';

export class FcmTokenDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ enum: EAppType })
  appType: EAppType;
}
