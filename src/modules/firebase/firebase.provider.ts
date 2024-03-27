import { ConfigService } from '@nestjs/config';

import * as firebaseAdmin from 'firebase-admin';

import { TFirebaseConfig } from '@configs/firebase.config';

import { FIREBASE_PROVIDER_TOKEN } from '@shared/constants/token.constant';

import { TConfigs } from '@src/configs';

export const FirebaseProvider = {
  provide: FIREBASE_PROVIDER_TOKEN,
  useFactory: async (configService: ConfigService<TConfigs>) =>
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: configService.get<TFirebaseConfig>('firebase').projectId,
        privateKey: configService.get<TFirebaseConfig>('firebase').privateKey,
        clientEmail: configService.get<TFirebaseConfig>('firebase').clientEmail,
      }),
    }),
  inject: [ConfigService],
};
