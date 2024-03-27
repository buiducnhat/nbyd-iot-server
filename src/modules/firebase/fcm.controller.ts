import {
  Body,
  Controller,
  Delete,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '@prisma/client';

import { ApiResponse } from '@shared/response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateFcmTokenDto } from './dto/create-fcm-token.dto';
import { DeleteFcmTokenDto } from './dto/delete-fcm-token.dto';
import { FcmTokenDto } from './dto/fcm-token.dto';
import { FcmService } from './fcm.service';

@Controller('firebase/fcm')
@ApiTags('Firebase FCM')
@JwtAuth()
@ApiBearerAuth()
@UseInterceptors(TransformResponseInterceptor)
export class FcmTokensController {
  constructor(private readonly fcmService: FcmService) {}

  @Post()
  @ApiResponse(FcmTokenDto)
  create(@CurrentUser() user: User, @Body() body: CreateFcmTokenDto) {
    return this.fcmService.create(body, user);
  }

  @Delete()
  @ApiResponse(FcmTokenDto)
  remove(@Body() body: DeleteFcmTokenDto, @CurrentUser() user: User) {
    return this.fcmService.deleteToken(body, user);
  }
}
