import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';

import { prismaExclude } from '@shared/helpers/prisma.helper';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { GetListProjectDto } from './dto/get-list-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateProjectDto, user: User) {
    return this.prisma.project.create({
      data: {
        ...input,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async getList(input: GetListProjectDto, user: User) {
    return this.prisma.project.findMany({
      select: {
        ...prismaExclude('Project', [
          'deletedAt',
          'updatedAt',
          'metaData',
          'mobileDashboard',
          'webDashboard',
        ]),
      },
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
        OR: input.search
          ? [
              { name: { contains: input.search } },
              { description: { contains: input.search } },
            ]
          : undefined,
      },
    });
  }

  async getProjectById(id: string, user: User) {
    return this.prisma.project.findFirst({
      select: {
        ...prismaExclude('Project', ['deletedAt']),
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarFile: { select: { path: true } },
              },
            },
          },
        },
        devices: {
          select: {
            id: true,
            name: true,
            hardware: true,
            imageFile: { select: { path: true } },
            createdAt: true,
          },
        },
      },
      where: {
        id,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });
  }
}
