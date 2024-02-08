import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '@prisma/client';

import { TAuthConfig } from '@configs/auth.config';
import { TConfigs } from '@configs/index';

import { CHttpException } from '@shared/custom-http-exception';
import { compareHash, generateHash } from '@shared/helpers/string.helper';

import { PrismaService } from '@src/prisma/prisma.service';

import { RegisterInputDto } from './dto/register.dto';
import { TokenAuthInputDto, TokenAuthResponseDto } from './dto/token-auth.dto';

@Injectable()
export class AuthService {
  private readonly accessTokenExpireIn: number;
  private readonly refreshTokenExpireIn: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<TConfigs>,
    private readonly prisma: PrismaService,
  ) {
    this.accessTokenExpireIn =
      this.configService.getOrThrow<TAuthConfig>('auth').accessTokenExpireIn;
    this.refreshTokenExpireIn =
      this.configService.getOrThrow<TAuthConfig>('auth').refreshTokenExpireIn;
  }

  async register(registerDto: RegisterInputDto): Promise<boolean> {
    const userLogin = await this.prisma.userLogin.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { username: registerDto.username }],
      },
    });

    if (userLogin) {
      throw new CHttpException(
        AuthService.name,
        HttpStatus.CONFLICT,
        'Username or Email already exists',
      );
    }

    const passwordHash = await generateHash(registerDto.password);

    await this.prisma.user.create({
      data: {
        userLogin: {
          create: {
            email: registerDto.email,
            username: registerDto.username,
            password: passwordHash,
          },
        },
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        gender: registerDto.gender,
        dateOfBirth: registerDto.dateOfBirth,
        roles: ['USER'],
      },
      include: {
        userLogin: true,
        externals: true,
      },
    });

    return true;
  }

  async tokenAuth(input: TokenAuthInputDto): Promise<TokenAuthResponseDto> {
    const userLogin = await this.prisma.userLogin.findFirst({
      where: {
        OR: [
          { email: input.usernameOrEmail },
          { username: input.usernameOrEmail },
        ],
      },
    });

    if (!userLogin) {
      throw new CHttpException(
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
        'Username or Email not found',
      );
    }

    const isPasswordValid = await compareHash(
      input.password,
      userLogin.password,
    );

    if (!isPasswordValid) {
      throw new CHttpException(
        AuthService.name,
        HttpStatus.UNAUTHORIZED,
        'Wrong password',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userLogin.userId,
      },
      include: {
        avatarFile: {
          select: {
            id: true,
            name: true,
            path: true,
            mimeType: true,
            size: true,
          },
        },
        userLogin: true,
        sessions: true,
        externals: true,
      },
    });

    const accessToken = this.generateJwtToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.accessTokenExpireIn,
      refreshTokenExpiresIn: this.refreshTokenExpireIn,
    };
  }

  private generateJwtToken(user: User) {
    return this.jwtService.sign({ user });
  }

  private generateRefreshToken(userId: number) {
    return this.jwtService.sign(
      { id: userId },
      {
        expiresIn: this.refreshTokenExpireIn,
      },
    );
  }
}
