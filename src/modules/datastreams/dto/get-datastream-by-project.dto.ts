import { IsInt, IsOptional } from 'class-validator';

export class GetDatastreamByProjectDto {
  @IsOptional()
  @IsInt()
  historyFrom?: number;

  @IsOptional()
  @IsInt()
  historyTo?: number;
}
