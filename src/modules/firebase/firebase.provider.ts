import { Provider } from '@nestjs/common';

import * as firebase from 'firebase-admin';

import { FIREBASE_PROVIDER_TOKEN } from '@shared/constants/token.constant';

import * as serviceAccount from '../../../firebase-adminsdk.json';

export const FirebaseProvider: Provider = {
  provide: FIREBASE_PROVIDER_TOKEN,
  useFactory: async () =>
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    }),
};
