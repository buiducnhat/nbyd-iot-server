import { IsOptional, IsString } from 'class-validator';

export class DeleteManyFcmTokenDto {
  @IsOptional()
  @IsString({ each: true })
  tokens?: string[];
}
