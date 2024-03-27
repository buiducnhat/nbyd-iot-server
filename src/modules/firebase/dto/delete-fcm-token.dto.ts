import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFcmTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
