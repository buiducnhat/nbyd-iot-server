import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { FilesModule } from '@modules/files/files.module';

import { CloudinaryModule } from '@src/cloudinary/cloudinary.module';
import { PrismaModule } from '@src/prisma/prisma.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule,
    CloudinaryModule,
    FilesModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
