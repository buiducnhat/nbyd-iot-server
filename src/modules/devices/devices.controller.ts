import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '@prisma/client';

import { ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeleteManyDevicesDto } from './dto/delete-many-devices.dto';
import { DeviceBasicDto } from './dto/device.dto';

@Controller('projects/:projectId/gateways/:gatewayId/devices')
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
    @Param('gatewayId') gatewayId: string,
    @Body() input: CreateDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.create(input, gatewayId, projectId, user);
  }

  @Patch(':id')
  @ApiResponse(DeviceBasicDto)
  async update(
    @Param('projectId') projectId: string,
    @Param('gatewayId') gatewayId: string,
    @Param('id') id: string,
    @Body() input: CreateDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.update(input, id, gatewayId, projectId, user);
  }

  @Delete(':id')
  @ApiResponse(DeviceBasicDto)
  async delete(
    @Param('projectId') projectId: string,
    @Param('gatewayId') gatewayId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.delete(id, gatewayId, projectId, user);
  }

  @Delete()
  @ApiResponse(DeviceBasicDto)
  async deleteMany(
    @Param('projectId') projectId: string,
    @Param('gatewayId') gatewayId: string,
    @Body() input: DeleteManyDevicesDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.deleteMany(input, gatewayId, projectId, user);
  }
}
