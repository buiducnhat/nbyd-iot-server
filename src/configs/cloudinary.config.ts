import { registerAs } from '@nestjs/config';

import { IsNotEmpty, IsString } from 'class-validator';

import validateConfig from '@shared/validator-config';

export interface TCloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  defaultFolder: string;
}

class CloudinaryConfigValidator {
  @IsString()
  @IsNotEmpty()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_DEFAULT_FOLDER: string;
}

export default registerAs<TCloudinaryConfig>('cloudinary', () => {
  validateConfig(process.env, CloudinaryConfigValidator);

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    defaultFolder: process.env.CLOUDINARY_DEFAULT_FOLDER,
  };
});
