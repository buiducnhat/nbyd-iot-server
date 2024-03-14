import { NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { TAppConfig } from '@configs/app.config';
import { TMqttConfig } from '@configs/mqtt.config';

import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './filters/global-exception.filter';
import { CLogger } from './logger/custom-logger';
import { CValidationPipe } from './pipes/validation.pipe';

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
});

async function bootstrap() {
  const options: NestApplicationOptions = {
    cors: true,
    logger: CLogger,
  };

  // Enable TLS
  if (process.env.ENABLE_TLS === 'true') {
    options.httpsOptions = {
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
    };
  }
  // End Enable TLS

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    options,
  );

  // Get app configs
  const configService = app.get(ConfigService);

  const host = configService.getOrThrow<TAppConfig>('app').host;
  const port = configService.getOrThrow<TAppConfig>('app').port;
  const apiPrefix = configService.getOrThrow<TAppConfig>('app').apiPrefix;
  // End Get app configs

  // Global setup
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalPipes(new CValidationPipe());
  // End Global setup

  // Swagger setup
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('NBYD IoT Platform Backend')
      .setDescription('Api documents for NBYD IoT Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup(apiPrefix, app, document);
  // End Swagger setup

  // MQTT setup
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: configService.getOrThrow<TMqttConfig>('mqtt').url,
      username: configService.getOrThrow<TMqttConfig>('mqtt').username,
      password: configService.getOrThrow<TMqttConfig>('mqtt').password,
    },
  });
  // End MQTT setup

  await app.startAllMicroservices();
  CLogger.log('Microservices are running', 'Bootstrap');

  await app.listen(port, host, () => {
    CLogger.log(`Server is running on ${host}:${port}`, 'Bootstrap');
  });
}

bootstrap();
