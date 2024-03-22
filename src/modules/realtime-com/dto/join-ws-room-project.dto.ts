import { IsString } from 'class-validator';

export class JoinWsRoomProjectDto {
  @IsString()
  projectId: string;
}
