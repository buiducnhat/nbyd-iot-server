import { ApiPropertyOptional } from '@nestjs/swagger';

import { ERole } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { TSearchInput } from '@shared/search';
import { TPaginatedInput } from '@shared/types/paginated.type';

export class AdminGetUsersDto implements TPaginatedInput, TSearchInput {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'List of role',
    isArray: true,
    enum: ERole,
  })
  @Transform(({ value }) => (value ? Array.prototype.concat(value) : []))
  roles?: ERole[];
}
