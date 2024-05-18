import { Module, forwardRef } from '@nestjs/common';

import { ProjectsModule } from '@modules/projects/projects.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [PrismaModule, forwardRef(() => ProjectsModule)],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
