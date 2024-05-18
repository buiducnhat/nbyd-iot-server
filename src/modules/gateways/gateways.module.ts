import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { DatastreamsModule } from '@modules/datastreams/datastreams.module';
import { ProjectsModule } from '@modules/projects/projects.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';

@Module({
  imports: [PrismaModule, ProjectsModule, CloudinaryModule, DatastreamsModule],
  controllers: [GatewaysController],
  providers: [GatewaysService],
})
export class GatewaysModule {}
