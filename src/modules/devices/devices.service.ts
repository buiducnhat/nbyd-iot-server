import { Inject, Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import * as uuid from 'uuid';

import { prismaExclude } from '@shared/helpers/prisma.helper';

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
        ...prismaExclude('Device', ['deletedAt']),
        imageFile: {
          select: {
            id: true,
            name: true,
            path: true,
            mimeType: true,
            size: true,
          },
        },
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
}
