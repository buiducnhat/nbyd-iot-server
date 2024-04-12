import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { DatastreamValue, User } from '@prisma/client';
import Redis from 'ioredis';

import { parseJson } from '@shared/helpers/parse-json.helper';

import { ProjectsService } from '@modules/projects/projects.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { AddValueDto } from './dto/add-value.dto';
import { CreateDatastreamDto } from './dto/create-datastream.dto';
import { DeleteManyDatastreamsDto } from './dto/delete-many-datastreams.dto';
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

  async getList(
    projectId?: string,
    deviceId?: string,
    user?: User,
    needValues?: boolean,
  ) {
    const datastreams = await this.prisma.datastream.findMany({
      where: {
        device: {
          id: deviceId ? deviceId : undefined,
          project: user
            ? {
                id: projectId,
                ...this.projectsService.inWhereFilter(user),
              }
            : { id: projectId },
        },
      },
    });

    if (needValues) {
      const datastreamValues = await this.getValues(
        datastreams.map((x) => x.id),
      );

      return datastreams.map((x) => {
        return {
          ...x,
          values: datastreamValues.get(x.id),
        };
      });
    }

    return datastreams;
  }

  async getValues(
    datastreamIds: string[],
  ): Promise<Map<string, DatastreamValue[]>> {
    const valuesMap = new Map<string, DatastreamValue[]>();
    for (const id of datastreamIds) {
      valuesMap.set(id, []);
    }

    const cachedKeys = await this.redis.keys('/datastreams/*/values');
    for (const key of cachedKeys) {
      const cachedDVsString = await this.redis.get(key);
      const cachedDVs = parseJson<DatastreamValue[]>(cachedDVsString, []);

      const datastreamId = key.split('/')[2];
      valuesMap.set(datastreamId, cachedDVs);
    }

    const notCachedIds = datastreamIds.filter(
      (id) => !cachedKeys.includes(`/datastreams/${id}/values`),
    );
    if (notCachedIds.length) {
      const values = await this.prisma.datastreamValue.findMany({
        where: {
          datastreamId: {
            in: notCachedIds,
          },
        },
      });

      for (const v of values) {
        valuesMap.get(v.datastreamId).push(v);
      }

      for (const id of notCachedIds) {
        await this.redis.set(
          `/datastreams/${id}/values`,
          JSON.stringify(valuesMap.get(id)),
        );
      }
    }

    return valuesMap;
  }

  async addValue({ datastreamId, value }: AddValueDto) {
    const cachedDVsString = await this.redis.get(
      `/datastreams/${datastreamId}/values`,
    );
    let cachedDVs = parseJson<DatastreamValue[]>(cachedDVsString, null);

    const datastream = await this.prisma.datastream.findUnique({
      where: { id: datastreamId },
      select: {
        id: true,
        values: !cachedDVs ? true : false,
      },
    });

    if (!datastream) {
      return;
    }

    if (cachedDVs) {
      cachedDVs.unshift({
        datastreamId,
        value,
        createdAt: new Date(),
      });
      datastream.values = cachedDVs;
    } else {
      if (!datastream.values) {
        datastream.values = [];
      }
      datastream.values.unshift({
        datastreamId,
        value,
        createdAt: new Date(),
      });
      cachedDVs = datastream.values;
    }

    await this.redis.set(
      `/datastreams/${datastreamId}/values`,
      JSON.stringify(cachedDVs),
    );

    return datastream;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncCachedDVsToDb() {
    const cachedKeys = await this.redis.keys('/datastreams/*/values');
    const cachedDVs = await Promise.all(
      cachedKeys.map(async (key) => {
        const cachedDVsString = await this.redis.get(key);
        return parseJson<DatastreamValue[]>(cachedDVsString, []);
      }),
    );

    const values = cachedDVs.flat();
    if (values.length) {
      await this.prisma.datastreamValue.createMany({
        data: values,
        skipDuplicates: true,
      });
    }

    await Promise.all(
      cachedKeys.map(async (key) => {
        await this.redis.del(key);
      }),
    );
  }
}
