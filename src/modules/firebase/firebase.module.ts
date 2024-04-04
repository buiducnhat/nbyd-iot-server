import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';

import { FcmTokensController } from './fcm.controller';
import { FcmService } from './fcm.service';
import { FirebaseProvider } from './firebase.provider';
import { FirestoreProvider } from './firestore.provider';

@Module({
  imports: [PrismaModule],
  controllers: [FcmTokensController],
  providers: [FirebaseProvider, FcmService, FirestoreProvider],
  exports: [FcmService, FirebaseProvider, FirestoreProvider],
})
export class FirebasesModule {}
