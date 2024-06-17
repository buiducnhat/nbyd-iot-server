import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetListDeviceDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  limitValue?: number;
}
