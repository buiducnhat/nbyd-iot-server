import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';

import { prismaExclude } from '@shared/helpers/prisma.helper';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { GetListProjectDto } from './dto/get-list-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  editorWhereFilter(user: User): any {
    return {
      members: {
        some: {
          OR: [
            {
              userId: user.id,
              role: 'OWNER',
            },
            {
              userId: user.id,
              role: 'DEVELOPER',
            },
          ],
        },
      },
    };
  }

  inWhereFilter(user: User) {
    return {
      members: {
        some: {
          userId: user.id,
        },
      },
    };
  }

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
          'updatedAt',
          'metaData',
          'mobileDashboard',
          'webDashboard',
        ]),
        _count: {
          select: {
            devices: true,
          },
        },
      },
      where: {
        ...this.inWhereFilter(user),
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
        ...prismaExclude('Project', []),
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
          include: {
            datastreams: true,
          },
        },
      },
      where: {
        id,
        ...this.inWhereFilter(user),
      },
    });
  }

  async update(input: UpdateProjectDto, id: string, user: User) {
    return this.prisma.project.update({
      where: {
        id,
        ...this.editorWhereFilter(user),
      },
      data: {
        ...input,
      },
    });
  }

  async delete(id: string, user: User) {
    return this.prisma.project.delete({
      where: {
        id,
        members: {
          some: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });
  }
}
