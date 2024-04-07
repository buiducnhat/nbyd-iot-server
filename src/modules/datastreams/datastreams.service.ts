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
    input?: GetDatastreamsByProjectDto,
    user?: User,
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
                  gte: new Date(input?.historyFrom || 0),
                  lte: new Date(input?.historyTo || new Date()),
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
      },
      where: {
        device: {
          project: user
            ? {
                id: projectId,
                ...this.projectsService.inWhereFilter(user),
              }
            : { id: projectId },
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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncCachedDHsToDb() {
    const keys = await this.redis.keys('/projects/*/datastream-histories');

    const dataToInsert: DatastreamHistory[] = [];

    const disHisDatastreams = await this.prisma.datastream.findMany({
      select: { id: true, enabledHistory: true },
      where: {
        enabledHistory: false,
      },
    });

    for (const key of keys) {
      const cachedDHsString = await this.redis.get(key);

      let cachedDHs: DatastreamHistory[] | undefined = undefined;
      try {
        cachedDHs = JSON.parse(cachedDHsString);
      } catch (error) {}

      if (!cachedDHs) {
        continue;
      }

      // Filter and process DatastreamHistory
      const filteredHistory = disHisDatastreams.flatMap((datastream) => {
        if (datastream.enabledHistory) {
          // If enabled, return all corresponding DatastreamHistory
          return cachedDHs.filter(
            (history) => history.datastreamId === datastream.id,
          );
        } else {
          // If disabled, find the latest DatastreamHistory and return only that
          const latestHistory = cachedDHs
            .filter((history) => history.datastreamId === datastream.id)
            .reduce((latest, current) =>
              current.createdAt > latest.createdAt ? current : latest,
            );
          return latestHistory ? [latestHistory] : []; // Return as array or empty array if no history found
        }
      });

      await this.redis.set(key, JSON.stringify(filteredHistory));

      dataToInsert.push(
        ...filteredHistory.map((h) => ({
          ...h,
          datastreamId: h.datastreamId,
          createdAt: h.createdAt,
        })),
      );
    }

    if (!dataToInsert.length) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.datastreamHistory.deleteMany(),
      this.prisma.datastreamHistory.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      }),
    ]);
  }
}
