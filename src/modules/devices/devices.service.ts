import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import uuid from 'uuid';

import { prismaExclude } from '@shared/helpers/prisma.helper';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateDeviceDto } from './dto/create-device.dto';
import { GetListDeviceDto } from './dto/get-list-device.dto';
import { ReGenTokenDto } from './dto/re-gen-token.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDeviceDto, projectId: string, user: User) {
    return this.prisma.device.create({
      data: {
        ...input,
        authToken: uuid.v4(),
        project: {
          connect: {
            id: projectId,
            OR: [
              {
                members: {
                  some: {
                    userId: user.id,
                    role: 'OWNER',
                  },
                },
              },
              {
                members: {
                  some: {
                    userId: user.id,
                    role: 'DEVELOPER',
                  },
                },
              },
            ],
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
        datastreams: {
          select: { ...prismaExclude('Datastream', ['deletedAt']) },
        },
      },
      where: {
        id,
        projectId,
        project: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    });
  }

  async getList(projectId: string, input: GetListDeviceDto, user: User) {
    return this.prisma.device.findMany({
      where: {
        projectId,
        project: {
          members: {
            some: {
              userId: user.id,
            },
          },
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
    id: string,
    input: UpdateDeviceDto,
    projectId: string,
    user: User,
  ) {
    return this.prisma.device.update({
      where: {
        id,
        projectId,
        project: {
          OR: [
            {
              members: {
                some: {
                  userId: user.id,
                  role: 'OWNER',
                },
              },
            },
            {
              members: {
                some: {
                  userId: user.id,
                  role: 'DEVELOPER',
                },
              },
            },
          ],
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
    id: string,
    input: ReGenTokenDto,
    projectId: string,
    user: User,
  ) {
    return this.prisma.device.update({
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
      data: {
        authToken: uuid.v4(),
        authTokenExpiry: input.authTokenExpiry,
      },
    });
  }
}
