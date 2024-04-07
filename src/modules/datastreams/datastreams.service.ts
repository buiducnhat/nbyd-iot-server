import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { DatastreamHistory, User } from '@prisma/client';
import * as dayjs from 'dayjs';
import Redis from 'ioredis';

import { ProjectsService } from '@modules/projects/projects.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateDatastreamDto } from './dto/create-datastream.dto';
import { CreateHistoryDto } from './dto/create-historty.dto';
import { DeleteManyDatastreamsDto } from './dto/delete-many-datastreams.dto';
import { GetDatastreamByProjectDto as GetDatastreamsByProjectDto } from './dto/get-datastream-by-project.dto';
import { UpdateDatastreamDto } from './dto/update-datastream.dto';

@Injectable()
export class DatastreamsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
    @InjectRedis() private readonly redis: Redis,
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

  async getListByProject(
    projectId: string,
    input: GetDatastreamsByProjectDto,
    user: User,
  ) {
    const cachedDHsString = await this.redis.get(
      `/projects/${projectId}/datastream-histories`,
    );

    let cachedDHs: DatastreamHistory[] | undefined = undefined;
    try {
      cachedDHs = JSON.parse(cachedDHsString);
    } catch (error) {}

    const datastreams = await this.prisma.datastream.findMany({
      include: {
        histories: cachedDHs
          ? undefined
          : {
              where: {
                createdAt: {
                  gte: new Date(input.historyFrom || 0),
                  lte: new Date(input.historyTo || new Date()),
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
      },
      where: {
        device: {
          project: {
            id: projectId,
            ...this.projectsService.inWhereFilter(user),
          },
        },
      },
    });

    if (!cachedDHs) {
      await this.redis.set(
        `/projects/${projectId}/datastream-histories`,
        JSON.stringify(datastreams.flatMap((ds) => ds.histories)),
      );

      return datastreams;
    } else {
      return datastreams.map((ds) => ({
        ...ds,
        histories: cachedDHs
          .filter((dh) => dh.datastreamId === ds.id)
          .sort((a, b) =>
            dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1,
          ),
      }));
    }
  }

  async createHistory({
    projectId,
    deviceId,
    datastreamId,
    value,
  }: CreateHistoryDto) {
    const cachedDHsString = await this.redis.get(
      `/projects/${projectId}/datastream-histories`,
    );

    let cachedDHs: DatastreamHistory[] | undefined = undefined;
    try {
      cachedDHs = JSON.parse(cachedDHsString);
    } catch (error) {}

    if (!cachedDHs) {
      const histories = await this.prisma.datastreamHistory.findMany({
        where: {
          datastream: {
            device: {
              id: deviceId,
              projectId,
            },
          },
        },
      });

      cachedDHs = histories;
    }

    cachedDHs.push({ datastreamId, value, createdAt: new Date() });

    await this.redis.set(
      `/projects/${projectId}/datastream-histories`,
      JSON.stringify(cachedDHs),
    );

    return cachedDHs;
  }

  // DELETE old data with disabled history datastream, keep the latest record
  @Cron(CronExpression.EVERY_HOUR)
  async deleteOldDHs() {
    let dhs = await this.prisma.datastreamHistory.groupBy({
      by: ['datastreamId'],
      _max: {
        createdAt: true,
      },
      where: {
        datastream: {
          enabledHistory: false,
        },
      },
    });

    dhs = dhs.filter((dh) => dh._max.createdAt);

    if (!dhs.length) {
      return;
    }

    await this.redis.del(
      dhs.map((ds) => `/projects/*/datastream-histories/${ds.datastreamId}`),
    );

    await this.prisma.datastreamHistory.deleteMany({
      where: {
        datastream: {
          enabledHistory: false,
        },
        OR: dhs.map((ds) => ({
          datastreamId: ds.datastreamId,
          createdAt: {
            lt: ds._max.createdAt,
          },
        })),
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncCachedDHsToDb() {
    const keys = await this.redis.keys('/projects/*/datastream-histories');

    const dataToInsert: DatastreamHistory[] = [];

    for (const key of keys) {
      const cachedDHsString = await this.redis.get(key);

      let cachedDHs: DatastreamHistory[] | undefined = undefined;
      try {
        cachedDHs = JSON.parse(cachedDHsString);
      } catch (error) {}

      if (!cachedDHs) {
        continue;
      }

      dataToInsert.push(
        ...cachedDHs.map((dh) => ({
          ...dh,
          datastreamId: dh.datastreamId,
          createdAt: dh.createdAt,
        })),
      );
    }

    if (!dataToInsert.length) {
      return;
    }

    await this.prisma.datastreamHistory.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });
  }
}
