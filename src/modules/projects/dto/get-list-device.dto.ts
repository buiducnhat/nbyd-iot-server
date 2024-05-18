import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class GetListDeviceDto {
  @ApiPropertyOptional()
  @Type(() => Boolean)
  needValues?: boolean;
}
