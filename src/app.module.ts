import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import appConfig from '@configs/app.config';
import authConfig from '@configs/auth.config';
import cloudinaryConfig from '@configs/cloudinary.config';

import { AuthModule } from '@modules/auth/auth.module';
import { DevicesModule } from '@modules/devices/devices.module';
import { FilesModule } from '@modules/files/files.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { UsersModule } from '@modules/users/users.module';

import { CloudinaryModule } from '@src/cloudinary/cloudinary.module';
import { HealthsController } from '@src/healths/health.controller';
import { PrismaModule } from '@src/prisma/prisma.module';

import { DatastreamsModule } from './modules/datastreams/datastreams.module';

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
    ProjectsModule,
    DevicesModule,
    DatastreamsModule,
  ],
  controllers: [HealthsController],
  providers: [],
})
export class AppModule {}
