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

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { GetListDeviceDto } from './dto/get-list-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('projects/:projectId/devices')
@ApiTags('Devices')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() input: CreateDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.create(input, projectId, user);
  }

  @Get()
  async getList(
    @Param('projectId') projectId: string,
    @Query() query: GetListDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.getList(projectId, query, user);
  }

  @Get('/:id')
  async getDetail(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.getDetail(id, projectId, user);
  }

  @Patch('/:id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() input: UpdateDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.update(id, input, projectId, user);
  }

  @Delete('/:id')
  async delete(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.delete(id, projectId, user);
  }
}
