import { Injectable } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';

import { DashboardDataDto } from './dto/dashboard-data.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  public async getDashboardData(): Promise<DashboardDataDto> {
    const usersCount = await this.prisma.user.count();
    const projectsCount = await this.prisma.project.count();
    const gatewaysCount = await this.prisma.gateway.count();
    const devicesCount = await this.prisma.device.count();

    return {
      usersCount,
      projectsCount,
      gatewaysCount,
      devicesCount,
    };
  }
}
