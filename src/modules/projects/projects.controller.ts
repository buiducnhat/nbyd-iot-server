import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { User } from '@prisma/client';

import {
  ApiArrayResponse,
  ApiPaginatedResponse,
  ApiResponse,
} from '@shared/response';

import { DevicesService } from '@modules/devices/devices.service';
import { DeviceDetailDto } from '@modules/devices/dto/device.dto';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { AdminDeleteManyProjectsDto } from './dto/admin-delete-project.dto';
import { AdminGetListProjectDto } from './dto/admin-get-list-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetListDeviceDto } from './dto/get-list-device.dto';
import { GetListProjectDto } from './dto/get-list-project.dto';
import { ProjectBasicDto, ProjectDetailDto } from './dto/project.dto';
import { UpdateProjectDashboardDto } from './dto/update-project-web-dashboard.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('Projects')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly devicesService: DevicesService,
  ) {}

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

  @Patch('/:id/dashboard')
  @ApiResponse(ProjectBasicDto)
  async updateDashboard(
    @Param('id') id: string,
    @Body() input: UpdateProjectDashboardDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.updateDashboard(input, id, user);
  }

  @Delete('/:id')
  @ApiResponse(ProjectBasicDto)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.delete(id, user);
  }

  @Patch('/:id/images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse(ProjectBasicDto)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.projectsService.uploadImage(id, file, user);
  }

  @Get('/:id/devices')
  @ApiArrayResponse(DeviceDetailDto)
  async getListDevice(
    @Param('id') id: string,
    @Query() input: GetListDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.devicesService.getList(id, undefined, user, input.limitValue);
  }

  @Get('/admin/list')
  @ApiPaginatedResponse(ProjectBasicDto)
  @RolesAuth(['ADMIN'])
  async adminGetList(@Query() input: AdminGetListProjectDto) {
    return this.projectsService.adminGetList(input);
  }

  @Delete('/admin/delete/:id')
  @RolesAuth(['ADMIN'])
  @ApiResponse(ProjectBasicDto)
  async adminDelete(@Param('id') id: string) {
    return this.projectsService.adminDeleteProject(id);
  }

  @Delete('/admin/delete-many')
  @RolesAuth(['ADMIN'])
  @ApiResponse(ProjectBasicDto)
  async adminDeleteMany(@Body() input: AdminDeleteManyProjectsDto) {
    return this.projectsService.adminDeleteManyProjects(input.ids);
  }
}
