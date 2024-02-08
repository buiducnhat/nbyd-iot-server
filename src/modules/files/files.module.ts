import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@src/cloudinary/cloudinary.module';
import { PrismaModule } from '@src/prisma/prisma.module';

import { FilesService } from './files.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
