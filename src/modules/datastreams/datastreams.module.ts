import { Module, forwardRef } from '@nestjs/common';

import { ProjectsModule } from '@modules/projects/projects.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DatastreamsController } from './datastreams.controller';
import { DatastreamsService } from './datastreams.service';

@Module({
  imports: [PrismaModule, forwardRef(() => ProjectsModule)],
  controllers: [DatastreamsController],
  providers: [DatastreamsService],
  exports: [DatastreamsService],
})
export class DatastreamsModule {}
