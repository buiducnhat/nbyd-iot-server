import { EGender } from '@prisma/client';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsString()
  gender?: EGender;

  @IsDateString()
  dateOfBirth?: string;
}
