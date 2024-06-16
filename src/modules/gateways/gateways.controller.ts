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
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { User } from '@prisma/client';

import { TConfigs } from '@configs/index';
import { TMqttConfig } from '@configs/mqtt.config';

import { ApiArrayResponse, ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { IsPublic } from '@src/decorators/is-public.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateGatewayDto } from './dto/create-gateway.dto';
import { GatewayBasicDto } from './dto/gateway.dto';
import { GetListGatewayDto } from './dto/get-list-gateway.dto';
import { ReGenTokenDto } from './dto/re-gen-token.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { GatewaysService } from './gateways.service';

@Controller('projects/:projectId/gateways')
@ApiTags('Gateways')
@ApiBearerAuth()
@JwtAuth()
@UseInterceptors(TransformResponseInterceptor)
export class GatewaysController {
  constructor(
    private readonly gatewayService: GatewaysService,
    private readonly configService: ConfigService<TConfigs>,
  ) {}

  @Post()
  @ApiResponse(GatewayBasicDto)
  async create(
    @Param('projectId') projectId: string,
    @Body() input: CreateGatewayDto,
    @CurrentUser() user: User,
  ) {
    return this.gatewayService.create(input, projectId, user);
  }

  @Get()
  @ApiArrayResponse(GatewayBasicDto)
  async getList(
    @Param('projectId') projectId: string,
    @Query() query: GetListGatewayDto,
    @CurrentUser() user: User,
  ) {
    return this.gatewayService.getList(query, projectId, user);
  }

  @Get('/:id')
  @ApiResponse(GatewayBasicDto)
  async getDetail(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.gatewayService.getDetail(id, projectId, user);
  }

  @Get('/auth-token/:authToken')
  @IsPublic()
  @ApiResponse(GatewayBasicDto)
  async getByAuthToken(
    @Param('projectId') projectId: string,
    @Param('authToken') authToken: string,
  ) {
    const gatewayData = await this.gatewayService.getByAuthToken(
      authToken,
      projectId,
    );

    if (!gatewayData) return null;

    return {
      ...gatewayData,
      mqtt: this.configService.get<TMqttConfig>('mqtt'),
    };
  }

  @Patch('/:id')
  @ApiResponse(GatewayBasicDto)
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() input: UpdateGatewayDto,
    @CurrentUser() user: User,
  ) {
    return this.gatewayService.update(input, id, projectId, user);
  }

  @Delete('/:id')
  @ApiResponse(GatewayBasicDto)
  async delete(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.gatewayService.delete(id, projectId, user);
  }

  @Post('/:id/re-gen-token')
  @ApiResponse(GatewayBasicDto)
  async reGenToken(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() input: ReGenTokenDto,
    @CurrentUser() user: User,
  ) {
    return this.gatewayService.reGenAuthToken(input, id, projectId, user);
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
  @ApiResponse(GatewayBasicDto)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.gatewayService.uploadImage(file, id, projectId, user);
  }
}
