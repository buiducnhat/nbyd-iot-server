import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, PassportModule, JwtModule, CloudinaryModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
