import { ConfigService } from '@nestjs/config';

import { v2 as cloudinary } from 'cloudinary';

import { TCloudinaryConfig } from '@configs/cloudinary.config';

import { CLOUDINARY_PROVIDER_TOKEN } from '@shared/constants/token.constant';

import { TConfigs } from '@src/configs';

export const CloudinaryProvider = {
  provide: CLOUDINARY_PROVIDER_TOKEN,
  useFactory: async (configService: ConfigService<TConfigs>) =>
    cloudinary.config({
      cloud_name: configService.get<TCloudinaryConfig>('cloudinary').cloudName,
      api_key: configService.get<TCloudinaryConfig>('cloudinary').apiKey,
      api_secret: configService.get<TCloudinaryConfig>('cloudinary').apiSecret,
    }),
  inject: [ConfigService],
};
