import { TAppConfig } from './app.config';
import { TAuthConfig } from './auth.config';
import { TCloudinaryConfig } from './cloudinary.config';

export type TConfigs = {
  app: TAppConfig;
  auth: TAuthConfig;
  cloudinary: TCloudinaryConfig;
};
