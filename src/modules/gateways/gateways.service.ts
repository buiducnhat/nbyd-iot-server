import { Inject, Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import * as uuid from 'uuid';

import { CNotFoundException } from '@shared/custom-http-exception';
import { prismaExclude } from '@shared/helpers/prisma.helper';

import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';
import { DevicesService } from '@modules/devices/devices.service';
import { ProjectsService } from '@modules/projects/projects.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateGatewayDto } from './dto/create-gateway.dto';
import { GetListGatewayDto } from './dto/get-list-gateway.dto';
import { ReGenTokenDto } from './dto/re-gen-token.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

@Injectable()
export class GatewaysService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
    private readonly cloudinary: CloudinaryService,
    private readonly devicesService: DevicesService,
  ) {}

  async create(input: CreateGatewayDto, projectId: string, user: User) {
    return this.prisma.gateway.create({
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
    return this.prisma.gateway.findFirst({
      select: {
        ...prismaExclude('Gateway', []),
        devices: true,
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
    const gateway = await this.prisma.gateway.findUnique({
      select: {
        id: true,
        name: true,
        hardware: true,
        connection: true,
        devices: true,
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

    if (!gateway) {
      throw new CNotFoundException('Gateway not found');
    }

    const devices = await this.devicesService.getList(projectId, gateway.id);
    const deviceValues = await this.devicesService.getValues(
      gateway.devices.map((x) => x.id),
    );

    return {
      ...gateway,
      devices: devices.map((x) => {
        const lastValueObj = deviceValues.get(x.id)?.[0];
        return {
          ...x,
          lastValue:
            lastValueObj?.value !== null && lastValueObj?.value !== undefined
              ? lastValueObj?.value
              : x.defaultValue,
        };
      }),
    };
  }

  async getList(input: GetListGatewayDto, projectId: string, user: User) {
    return this.prisma.gateway.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    input: UpdateGatewayDto,
    id: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.gateway.update({
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
    return this.prisma.gateway.delete({
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
    return this.prisma.gateway.update({
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
    const gateway = await this.prisma.gateway.findUnique({
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

    if (!gateway) {
      throw new CNotFoundException('Gateway not found');
    }

    const uploaded = await this.cloudinary.replaceFile(
      gateway.imageFileId,
      file,
      'gateways/images',
    );

    return await this.prisma.gateway.update({
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
