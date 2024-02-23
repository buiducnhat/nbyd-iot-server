import { Inject, Injectable } from '@nestjs/common';

import { User } from '@prisma/client';

import { ProjectsService } from '@modules/projects/projects.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateDatastreamDto } from './dto/create-datastream.dto';
import { DeleteManyDatastreamsDto } from './dto/delete-many-datastreams.dto';
import { UpdateDatastreamDto } from './dto/update-datastream.dto';

@Injectable()
export class DatastreamsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  async create(
    input: CreateDatastreamDto,
    deviceId: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.datastream.create({
      data: {
        ...input,
        device: {
          connect: {
            id: deviceId,
            project: {
              id: projectId,
              ...this.projectsService.editorWhereFilter(user),
            },
          },
        },
      },
    });
  }

  async update(
    input: UpdateDatastreamDto,
    id: string,
    deviceId: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.datastream.update({
      where: {
        id: id,
        deviceId: deviceId,
        device: {
          project: {
            id: projectId,
            ...this.projectsService.editorWhereFilter(user),
          },
        },
      },
      data: input,
    });
  }

  async delete(id: string, deviceId: string, projectId: string, user: User) {
    return this.prisma.datastream.delete({
      where: {
        id: id,
        deviceId: deviceId,
        device: {
          project: {
            id: projectId,
            ...this.projectsService.editorWhereFilter(user),
          },
        },
      },
    });
  }

  async deleteMany(
    input: DeleteManyDatastreamsDto,
    deviceId: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.datastream.deleteMany({
      where: {
        id: {
          in: input.ids,
        },
        deviceId,
        device: {
          project: {
            id: projectId,
            ...this.projectsService.editorWhereFilter(user),
          },
        },
      },
    });
  }
}
