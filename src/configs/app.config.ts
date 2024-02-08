import { registerAs } from '@nestjs/config';

import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

import validateConfig from '@shared/validator-config';

export enum ENodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export type TAppConfig = {
  nodeEnv: ENodeEnv;
  host: string;
  port: number;
  bcryptSalt: number;
  apiPrefix: string;
};

class AppConfigValidator {
  @IsUrl()
  @IsOptional()
  HOST?: string;

  @IsInt()
  @IsOptional()
  PORT?: number;

  @IsInt()
  @IsOptional()
  BCRYPT_SALT?: number;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;
}

export default registerAs<TAppConfig>('app', () => {
  validateConfig(process.env, AppConfigValidator);

  return {
    nodeEnv: (process.env.NODE_ENV as ENodeEnv) || ENodeEnv.DEVELOPMENT,
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT) || 4000,
    bcryptSalt: parseInt(process.env.BCRYPT_SALT) || 10,
    apiPrefix: process.env.API_PREFIX || 'api',
  };
});
