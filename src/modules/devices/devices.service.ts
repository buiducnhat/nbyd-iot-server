import { Inject, Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import * as uuid from 'uuid';

import { CNotFoundException } from '@shared/custom-http-exception';
import { prismaExclude } from '@shared/helpers/prisma.helper';

import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';
import { ProjectsService } from '@modules/projects/projects.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateDeviceDto } from './dto/create-device.dto';
import { GetListDeviceDto } from './dto/get-list-device.dto';
import { ReGenTokenDto } from './dto/re-gen-token.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(input: CreateDeviceDto, projectId: string, user: User) {
    return this.prisma.device.create({
      data: {
        ...input,
        authToken: uuid.v4(),
        project: {
          connect: {
            id: projectId,
            ...this.projectsService.editorWhereFilter(user),
          },
        },
      },
    });
  }

  async getDetail(id: string, projectId: string, user: User) {
    return this.prisma.device.findFirst({
      select: {
        ...prismaExclude('Device', []),
        datastreams: true,
      },
      where: {
        id,
        projectId,
        project: {
          ...this.projectsService.inWhereFilter(user),
        },
      },
    });
  }

  async getByAuthToken(authToken: string, projectId: string) {
    return this.prisma.device.findUnique({
      select: {
        id: true,
        name: true,
        hardware: true,
        connection: true,
        datastreams: {
          select: {
            id: true,
            type: true,
            pin: true,
            mode: true,
            dataType: true,
            histories: {
              select: {
                value: true,
              },
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
      where: {
        authToken,
        projectId,
        OR: [
          { authTokenExpiry: null },
          { authTokenExpiry: { gt: new Date() } },
        ],
      },
    });
  }

  async getList(input: GetListDeviceDto, projectId: string, user: User) {
    return this.prisma.device.findMany({
      where: {
        projectId,
        project: {
          ...this.projectsService.inWhereFilter(user),
        },
        name: input.search
          ? {
              contains: input.search,
              mode: 'insensitive',
            }
          : undefined,
      },
    });
  }

  async update(
    input: UpdateDeviceDto,
    id: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.device.update({
      where: {
        id,
        projectId,
        project: {
          ...this.projectsService.editorWhereFilter(user),
        },
      },
      data: input,
    });
  }

  async delete(id: string, projectId: string, user: User) {
    return this.prisma.device.delete({
      where: {
        id,
        projectId,
        project: {
          members: {
            some: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      },
    });
  }

  async reGenAuthToken(
    input: ReGenTokenDto,
    id: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.device.update({
      where: {
        id,
        projectId,
        project: {
          ...this.projectsService.editorWhereFilter(user),
        },
      },
      data: {
        authToken: uuid.v4(),
        authTokenExpiry: input.authTokenExpiry,
      },
    });
  }

  public async uploadImage(
    file: Express.Multer.File,
    id: string,
    projectId: string,
    user: User,
  ) {
    const device = await this.prisma.device.findUnique({
      where: {
        id,
        project: {
          id: projectId,
          members: {
            some: {
              userId: user.id,
              role: { in: ['OWNER', 'DEVELOPER'] },
            },
          },
        },
      },
    });

    if (!device) {
      throw new CNotFoundException('Device not found');
    }

    const uploaded = await this.cloudinary.replaceFile(
      device.imageFileId,
      file,
      'devices/images',
    );

    return await this.prisma.device.update({
      where: {
        id,
      },
      data: {
        imageFileId: uploaded.public_id,
        imageFileUrl: uploaded.url,
      },
    });
  }
}
