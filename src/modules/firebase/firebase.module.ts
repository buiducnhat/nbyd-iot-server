import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '@src/prisma/prisma.module';

import { FcmTokensController } from './fcm.controller';
import { FcmService } from './fcm.service';
import { FirebaseProvider } from './firebase.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FcmTokensController],
  providers: [FirebaseProvider, FcmService],
  exports: [FcmService],
})
export class FirebasesModule {}
