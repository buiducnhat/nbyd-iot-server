import { Module, forwardRef } from '@nestjs/common';

import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { DevicesModule } from '@modules/devices/devices.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [PrismaModule, CloudinaryModule, forwardRef(() => DevicesModule)],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
