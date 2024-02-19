import { IsInt, IsString } from 'class-validator';

export class FileBasicDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  mimeType: string;

  @IsInt()
  size: number;
}
