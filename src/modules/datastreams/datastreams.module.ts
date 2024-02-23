import { Module } from '@nestjs/common';

import { ProjectsModule } from '@modules/projects/projects.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DatastreamsController } from './datastreams.controller';
import { DatastreamsService } from './datastreams.service';

@Module({
  imports: [PrismaModule, ProjectsModule],
  controllers: [DatastreamsController],
  providers: [DatastreamsService],
})
export class DatastreamsModule {}
