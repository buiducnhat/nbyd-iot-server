import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ERole, User } from '@prisma/client';

import { RestResponse } from '@shared/rest-response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { RolesAuth } from '@src/decorators/roles-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { AuthService } from './auth.service';
import { RegisterInputDto } from './dto/register.dto';
import { TokenAuthInputDto, TokenAuthResponseDto } from './dto/token-auth.dto';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/token-auth')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: TokenAuthResponseDto,
  })
  @UseInterceptors(TransformResponseInterceptor)
  async tokenAuth(
    @Body() input: TokenAuthInputDto,
  ): Promise<TokenAuthResponseDto> {
    return this.authService.tokenAuth(input);
  }

  @Post('/register')
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Boolean,
  })
  @UseInterceptors(TransformResponseInterceptor)
  async register(@Body() registerDto: RegisterInputDto): Promise<boolean> {
    return this.authService.register(registerDto);
  }

  @Get('/me')
  @ApiBearerAuth()
  @JwtAuth()
  @UseInterceptors(TransformResponseInterceptor)
  async me(@CurrentUser() currentUser: User) {
    return currentUser;
  }

  @Get('/admin')
  @ApiBearerAuth()
  @RolesAuth([ERole.ADMIN])
  @JwtAuth()
  @UseInterceptors(TransformResponseInterceptor)
  async admin() {
    return RestResponse.ok({ data: { message: 'Admin route for testing' } });
  }

  @Get('/facebook')
  @UseGuards(FacebookAuthGuard)
  async loginWithFacebook() {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  async loginFacebookRedirect(@CurrentUser() user: User): Promise<any> {
    return user;
  }

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  async loginWithGoogle() {
    return HttpStatus.OK;
  }

  @Get('/google/redirect')
  @UseGuards(GoogleAuthGuard)
  async loginGoogleRedirect(@CurrentUser() user: User): Promise<any> {
    return user;
  }
}
