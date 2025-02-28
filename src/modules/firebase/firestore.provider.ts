import { Provider } from '@nestjs/common';

import * as firebase from 'firebase-admin';

import { FIRESTORE_PROVIDER_TOKEN } from '@shared/constants/token.constant';

type TTest = {
  deviceId: string;
  value: string;
  timestamp: Date;
};

export type TFirestore = {
  test: firebase.firestore.CollectionReference<TTest>;
};

export const FirestoreProvider: Provider = {
  provide: FIRESTORE_PROVIDER_TOKEN,
  useFactory: () => {
    const converter = <T>() => ({
      toFirestore: (data: Partial<T>) => data,
      fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as T,
    });

    const dataPoint = <T>(collectionPath: string) =>
      firebase
        .firestore()
        .collection(collectionPath)
        .withConverter(converter<T>());

    const firestore: TFirestore = {
      test: dataPoint<TTest>('test'),
    };

    return firestore;
  },
};
