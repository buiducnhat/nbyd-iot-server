import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

import { RedisModule } from '@nestjs-modules/ioredis';

import appConfig from '@configs/app.config';
import authConfig from '@configs/auth.config';
import cloudinaryConfig from '@configs/cloudinary.config';
import mqttConfig from '@configs/mqtt.config';
import redisConfig, { TRedisConfig } from '@configs/redis.config';

import { AuthModule } from '@modules/auth/auth.module';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { FirebasesModule } from '@modules/firebase/firebase.module';
import { GatewaysModule } from '@modules/gateways/gateways.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { UsersModule } from '@modules/users/users.module';

import { HealthsController } from '@src/healths/health.controller';
import { PrismaModule } from '@src/prisma/prisma.module';

import { TConfigs } from './configs';
import { DevicesModule } from './modules/devices/devices.module';
import { RealtimeComModule } from './modules/realtime-com/realtime-com.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, cloudinaryConfig, mqttConfig, redisConfig],
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService<TConfigs>) => ({
        type: 'single',
        url: configService.get<TRedisConfig>('redis').url,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    TerminusModule,
    CloudinaryModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    GatewaysModule,
    DevicesModule,
    RealtimeComModule,
    FirebasesModule,
  ],
  controllers: [HealthsController],
  providers: [],
})
export class AppModule {}
