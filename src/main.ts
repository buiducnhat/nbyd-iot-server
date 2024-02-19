import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

import { TAppConfig } from '@configs/app.config';

import { AppModule } from './app.module';
import { TConfigs } from './configs';
import { GlobalExceptionsFilter } from './filters/global-exception.filter';
import { CustomLogger } from './logger/custom-logger';
import { CValidationPipe } from './pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      cors: true,
      logger: CustomLogger,
    },
  );
  const configService = app.get(ConfigService<TConfigs>);

  const host = configService.getOrThrow<TAppConfig>('app').host;
  const port = configService.getOrThrow<TAppConfig>('app').port;
  const apiPrefix = configService.getOrThrow<TAppConfig>('app').apiPrefix;

  app.setGlobalPrefix(apiPrefix);

  app.register(multipart);
  app.register(cors);

  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalPipes(new CValidationPipe());

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

  await app.listen(port, host, () => {
    CustomLogger.log(`Server is running on ${host}:${port}`, 'Bootstrap');
  });
}

bootstrap();
