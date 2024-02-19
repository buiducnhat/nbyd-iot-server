import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '@prisma/client';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateProjectDto } from './dto/create-project.dto';
import { GetListProjectDto } from './dto/get-list-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('Projects')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() input: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectsService.create(input, user);
  }

  @Get()
  async getList(@Query() query: GetListProjectDto, @CurrentUser() user: User) {
    return this.projectsService.getList(query, user);
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.getProjectById(id, user);
  }
}
