import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { TConfigs } from '@configs/index';
import { TMqttConfig } from '@configs/mqtt.config';

import { AuthModule } from '@modules/auth/auth.module';
import { DevicesModule } from '@modules/devices/devices.module';
import { FirebasesModule } from '@modules/firebase/firebase.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { RealtimeComController } from './realtime-com.controller';
import { RealtimeComGateway } from './realtime-com.gateway';
import { RealtimeComService } from './realtime-com.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MQTT_CLIENT',
        inject: [ConfigService],
        useFactory: (configService: ConfigService<TConfigs>) => {
          return {
            transport: Transport.MQTT,
            options: {
              url: configService.get<TMqttConfig>('mqtt').url,
              username: configService.get<TMqttConfig>('mqtt').username,
              password: configService.get<TMqttConfig>('mqtt').password,
              serializer: {
                serialize(value) {
                  return value.data;
                },
              },
            },
          };
        },
      },
    ]),
    PrismaModule,
    AuthModule,
    FirebasesModule,
    forwardRef(() => DevicesModule),
  ],
  controllers: [RealtimeComController],
  providers: [RealtimeComGateway, RealtimeComService],
  exports: [RealtimeComService],
})
export class RealtimeComModule {}
