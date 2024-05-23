import { ApiPropertyOptional } from '@nestjs/swagger';

import { EProjectStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { PaginatedSearchSortInput } from '@shared/base-get-input';

export class AdminGetListProjectDto extends PaginatedSearchSortInput {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'List of status',
    isArray: true,
    enum: EProjectStatus,
  })
  @Transform(({ value }) => (value ? Array.prototype.concat(value) : []))
  statuses?: EProjectStatus[];
}
