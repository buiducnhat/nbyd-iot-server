import { TAppConfig } from './app.config';
import { TAuthConfig } from './auth.config';
import { TCloudinaryConfig } from './cloudinary.config';
import { TMqttConfig } from './mqtt.config';

export type TConfigs = {
  app: TAppConfig;
  auth: TAuthConfig;
  cloudinary: TCloudinaryConfig;
  mqtt: TMqttConfig;
};
