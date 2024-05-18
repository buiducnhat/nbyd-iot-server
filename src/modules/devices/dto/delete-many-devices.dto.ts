import { IsString } from 'class-validator';

export class DeleteManyDevicesDto {
  @IsString({ each: true })
  ids: string[];
}
