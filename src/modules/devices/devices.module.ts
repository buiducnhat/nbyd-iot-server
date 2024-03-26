import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { ProjectsModule } from '@modules/projects/projects.module';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [PrismaModule, ProjectsModule, CloudinaryModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
