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

import { DatastreamsService } from './datastreams.service';
import { CreateDatastreamDto } from './dto/create-datastream.dto';
import { DatastreamBasicDto } from './dto/datastream.dto';
import { DeleteManyDatastreamsDto } from './dto/delete-many-datastreams.dto';

@Controller('projects/:projectId/gateways/:gatewayId/datastreams')
@ApiTags('Datastreams')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class DatastreamsController {
  constructor(private readonly datastreamService: DatastreamsService) {}

  @Post()
  @ApiResponse(DatastreamBasicDto)
  async create(
    @Param('projectId') projectId: string,
    @Param('gatewayId') gatewayId: string,
    @Body() input: CreateDatastreamDto,
    @CurrentUser() user: User,
  ) {
    return this.datastreamService.create(input, gatewayId, projectId, user);
  }

  @Patch(':id')
  @ApiResponse(DatastreamBasicDto)
  async update(
    @Param('projectId') projectId: string,
    @Param('gatewayId') gatewayId: string,
    @Param('id') id: string,
    @Body() input: CreateDatastreamDto,
    @CurrentUser() user: User,
  ) {
    return this.datastreamService.update(input, id, gatewayId, projectId, user);
  }

  @Delete(':id')
  @ApiResponse(DatastreamBasicDto)
  async delete(
    @Param('projectId') projectId: string,
    @Param('gatewayId') gatewayId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.datastreamService.delete(id, gatewayId, projectId, user);
  }

  @Delete()
  @ApiResponse(DatastreamBasicDto)
  async deleteMany(
    @Param('projectId') projectId: string,
    @Param('gatewayId') gatewayId: string,
    @Body() input: DeleteManyDatastreamsDto,
    @CurrentUser() user: User,
  ) {
    return this.datastreamService.deleteMany(input, gatewayId, projectId, user);
  }
}
