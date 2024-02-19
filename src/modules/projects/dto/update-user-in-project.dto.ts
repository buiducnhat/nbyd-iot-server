import { EProjectMemberRole } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserInProjectDto {
  @IsOptional()
  @IsEnum(EProjectMemberRole)
  role?: EProjectMemberRole;
}
