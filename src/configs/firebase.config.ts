import { registerAs } from '@nestjs/config';

import { IsNotEmpty, IsString } from 'class-validator';

import validateConfig from '@shared/validator-config';

export type TFirebaseConfig = {
  projectId: string;
  privateKey: string;
  clientEmail: string;
};

class FirebaseConfigValidator {
  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_CLIENT_EMAIL: string;
}

export default registerAs<TFirebaseConfig>('firebase', () => {
  validateConfig(process.env, FirebaseConfigValidator);

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
});
