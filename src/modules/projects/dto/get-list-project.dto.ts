import { IsOptional, IsString, MaxLength } from 'class-validator';

import { TSearchInput } from '@shared/types/search.type';

export class GetListProjectDto implements TSearchInput {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;
}
