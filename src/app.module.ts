import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

import appConfig from '@configs/app.config';
import authConfig from '@configs/auth.config';
import cloudinaryConfig from '@configs/cloudinary.config';
import mqttConfig from '@configs/mqtt.config';

import { AuthModule } from '@modules/auth/auth.module';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { DevicesModule } from '@modules/devices/devices.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { UsersModule } from '@modules/users/users.module';

import { HealthsController } from '@src/healths/health.controller';
import { PrismaModule } from '@src/prisma/prisma.module';

import { DatastreamsModule } from './modules/datastreams/datastreams.module';
import { RealtimeComModule } from './modules/realtime-com/realtime-com.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, cloudinaryConfig, mqttConfig],
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    ScheduleModule.forRoot(),
    TerminusModule,
    CloudinaryModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    DevicesModule,
    DatastreamsModule,
    RealtimeComModule,
  ],
  controllers: [HealthsController],
  providers: [],
})
export class AppModule {}
