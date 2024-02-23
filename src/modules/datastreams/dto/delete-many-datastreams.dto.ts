import { IsString } from 'class-validator';

export class DeleteManyDatastreamsDto {
  @IsString({ each: true })
  ids: string[];
}
