/**
 * This Gist is part of a medium article - read here:
 * https://jamiecurnow.medium.com/using-firestore-with-typescript-65bd2a602945
 */
// import firstore (obviously)
import * as firebase from 'firebase-admin';

// Import or define your types
// import { YourType } from '~/@types'
type TDatastreamHistory = {
  datastreamId: string;
  value: string;
  timestamp: Date;
};

// This helper function pipes your types through a firestore converter
const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
    snap.data() as T,
});

// This helper function exposes a 'typed' version of firestore().collection(collectionPath)
// Pass it a collectionPath string as the path to the collection in firestore
// Pass it a type argument representing the 'type' (schema) of the docs in the collection
const dataPoint = <T>(collectionPath: string) =>
  firebase.firestore().collection(collectionPath).withConverter(converter<T>());

// Construct a database helper object
const firestore = {
  // list your collections here
  datastreamHistory: dataPoint<TDatastreamHistory>('datastream-histories'),
};

// export your helper
export { firestore };
export default firestore;
