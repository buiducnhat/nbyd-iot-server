import { EProjectMemberRole } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';

export class AddUserToProjectDto {
  @IsInt()
  userId: number;

  @IsEnum(EProjectMemberRole)
  role: EProjectMemberRole;
}
