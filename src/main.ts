import { NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as fs from 'fs';

import { TAppConfig } from '@configs/app.config';

import { AppModule } from './app.module';
import { TConfigs } from './configs';
import { GlobalExceptionsFilter } from './filters/global-exception.filter';
import { CLogger } from './logger/custom-logger';
import { CValidationPipe } from './pipes/validation.pipe';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  // Get app configs
  const configService = appContext.get(ConfigService<TConfigs>);

  const host = configService.getOrThrow<TAppConfig>('app').host;
  const port = configService.getOrThrow<TAppConfig>('app').port;
  const enableTLS = configService.getOrThrow<TAppConfig>('app').enableTLS;
  const apiPrefix = configService.getOrThrow<TAppConfig>('app').apiPrefix;
  // End Get app configs

  const options: NestApplicationOptions = {
    cors: true,
    logger: CLogger,
  };

  // Enable TLS
  if (enableTLS) {
    options.httpsOptions = {
      cert: fs.readFileSync(configService.get<TAppConfig>('app').sslCertPath),
      key: fs.readFileSync(configService.get<TAppConfig>('app').sslKeyPath),
    };
  }
  // End Enable TLS

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    options,
  );

  // Global setup
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalPipes(new CValidationPipe());
  // End Global setup

  // Swagger setup
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('NBYD IOT API')
      .setDescription('Api documents for NBYD API platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup(apiPrefix, app, document);
  // End Swagger setup

  await app.startAllMicroservices();
  CLogger.log('Microservices are running', 'Bootstrap');

  await app.listen(port, host, () => {
    CLogger.log(`Server is running on ${host}:${port}`, 'Bootstrap');
  });
}

bootstrap();
