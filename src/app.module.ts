import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import appConfig from '@configs/app.config';
import authConfig from '@configs/auth.config';
import cloudinaryConfig from '@configs/cloudinary.config';

import { AuthModule } from '@modules/auth/auth.module';

import { CloudinaryModule } from '@src/cloudinary/cloudinary.module';
import { HealthsController } from '@src/healths/health.controller';

import { FilesModule } from './modules/files/files.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, cloudinaryConfig],
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    TerminusModule,
    CloudinaryModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    FilesModule,
  ],
  controllers: [HealthsController],
  providers: [],
})
export class AppModule {}
