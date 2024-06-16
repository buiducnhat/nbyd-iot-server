import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { DevicesModule } from '@modules/devices/devices.module';
import { ProjectsModule } from '@modules/projects/projects.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    CloudinaryModule,
    DevicesModule,
    ConfigModule,
  ],
  controllers: [GatewaysController],
  providers: [GatewaysService],
})
export class GatewaysModule {}
