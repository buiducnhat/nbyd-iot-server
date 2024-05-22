import { Module, forwardRef } from '@nestjs/common';

import { ProjectsModule } from '@modules/projects/projects.module';
import { RealtimeComModule } from '@modules/realtime-com/realtime-com.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ProjectsModule),
    forwardRef(() => RealtimeComModule),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
