import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsInt()
  size: number;

  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
