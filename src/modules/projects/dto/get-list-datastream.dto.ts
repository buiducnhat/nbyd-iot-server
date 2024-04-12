import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class GetListDatastreamDto {
  @ApiPropertyOptional()
  @Type(() => Boolean)
  needValues?: boolean;
}
