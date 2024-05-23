import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class AdminDeleteManyProjectsDto {
  @ApiProperty()
  @IsString({ each: true })
  ids: string[];
}
