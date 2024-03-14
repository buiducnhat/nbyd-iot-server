import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '@prisma/client';

import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateProjectDto } from './dto/create-project.dto';
import { GetListProjectDto } from './dto/get-list-project.dto';
import { ProjectBasicDto, ProjectDetailDto } from './dto/project.dto';
import { UpdateProjectWebDashboardDto } from './dto/update-project-web-dashboard.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('Projects')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiResponse(ProjectBasicDto)
  async create(@Body() input: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectsService.create(input, user);
  }

  @Get()
  @ApiArrayResponse(ProjectBasicDto)
  async getList(@Query() query: GetListProjectDto, @CurrentUser() user: User) {
    return this.projectsService.getList(query, user);
  }

  @Get('/:id')
  @ApiResponse(ProjectDetailDto)
  async getProjectById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.getProjectById(id, user);
  }

  @Patch('/:id')
  @ApiResponse(ProjectBasicDto)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.update(input, id, user);
  }

  @Patch('/:id/web-dashboard')
  @ApiResponse(ProjectBasicDto)
  async updateWebDashboard(
    @Param('id') id: string,
    @Body() input: UpdateProjectWebDashboardDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.updateWebDashboard(input, id, user);
  }

  @Delete('/:id')
  @ApiResponse(ProjectBasicDto)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.delete(id, user);
  }
}
