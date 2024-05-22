import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiResponse } from '@shared/response';

import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { DashboardService } from './dashboard.service';
import { DashboardDataDto } from './dto/dashboard-data.dto';

@Controller('dashboard')
@ApiTags('Dashboard')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiResponse(DashboardDataDto)
  @RolesAuth(['ADMIN'])
  public async getDashboardData() {
    return this.dashboardService.getDashboardData();
  }
}
