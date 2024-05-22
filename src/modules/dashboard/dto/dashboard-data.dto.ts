import { ApiProperty } from '@nestjs/swagger';

export class DashboardDataDto {
  @ApiProperty()
  usersCount: number;

  @ApiProperty()
  projectsCount: number;

  @ApiProperty()
  gatewaysCount: number;

  @ApiProperty()
  devicesCount: number;
}
