import { IsDateString } from 'class-validator';

export class ReGenTokenDto {
  @IsDateString()
  authTokenExpiry?: string;
}
