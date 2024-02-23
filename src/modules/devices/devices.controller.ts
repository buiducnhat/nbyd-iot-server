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

import { DevicesService } from './devices.service';
import { CreateDatastreamDto } from './dto/create-datastream.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DatastreamBasicDto } from './dto/datastream.dto';
import { DeviceBasicDto } from './dto/device.dto';
import { GetListDeviceDto } from './dto/get-list-device.dto';
import { ReGenTokenDto } from './dto/re-gen-token.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('projects/:projectId/devices')
@ApiTags('Devices')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @Post()
  @ApiResponse(DeviceBasicDto)
  async create(
    @Param('projectId') projectId: string,
    @Body() input: CreateDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.create(input, projectId, user);
  }

  @Get()
  @ApiArrayResponse(DeviceBasicDto)
  async getList(
    @Param('projectId') projectId: string,
    @Query() query: GetListDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.getList(projectId, query, user);
  }

  @Get('/:id')
  @ApiResponse(DeviceBasicDto)
  async getDetail(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.getDetail(id, projectId, user);
  }

  @Patch('/:id')
  @ApiResponse(DeviceBasicDto)
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() input: UpdateDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.update(id, input, projectId, user);
  }

  @Delete('/:id')
  @ApiResponse(DeviceBasicDto)
  async delete(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.delete(id, projectId, user);
  }

  @Post('/:id/re-gen-token')
  @ApiResponse(DeviceBasicDto)
  async reGenToken(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() input: ReGenTokenDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.reGenAuthToken(id, input, projectId, user);
  }

  @Post('/:id/datastreams/')
  @ApiResponse(DatastreamBasicDto)
  async createDatastream(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() input: CreateDatastreamDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.createDatastream(id, projectId, input, user);
  }
}
