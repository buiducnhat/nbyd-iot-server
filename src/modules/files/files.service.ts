import { Injectable } from '@nestjs/common';

import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { PrismaService } from '@src/prisma/prisma.service';

import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async create(createFileDto: CreateFileDto) {
    return this.prisma.file.create({
      data: createFileDto,
    });
  }

  public async findAll() {
    return this.prisma.file.findMany();
  }

  public async findOne(id: string) {
    return this.prisma.file.findUnique({
      where: {
        id,
      },
    });
  }

  public async update(id: string, createFileDto: CreateFileDto) {
    return this.prisma.file.update({
      where: {
        id,
      },
      data: createFileDto,
    });
  }

  public async remove(id: string) {
    const file = await this.prisma.file.findUnique({
      where: {
        id,
      },
    });

    await this.cloudinaryService.deleteFile(file.id);

    return this.prisma.file.delete({
      where: {
        id,
      },
    });
  }
}
