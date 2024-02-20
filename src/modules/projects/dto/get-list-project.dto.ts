import { IsOptional, IsString, MaxLength } from 'class-validator';

import { SearchInput } from '@shared/base-get-input';

export class GetListProjectDto implements SearchInput {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;
}
