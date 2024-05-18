import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { DeviceValue, User } from '@prisma/client';
import Redis from 'ioredis';

import { parseJson } from '@shared/helpers/parse-json.helper';

import { ProjectsService } from '@modules/projects/projects.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { AddValueDto } from './dto/add-value.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeleteManyDevicesDto } from './dto/delete-many-devices.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(
    input: CreateDeviceDto,
    gatewayId: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.device.create({
      data: {
        ...input,
        gateway: {
          connect: {
            id: gatewayId,
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
    input: UpdateDeviceDto,
    id: string,
    gatewayId: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.device.update({
      where: {
        id: id,
        gatewayId: gatewayId,
        gateway: {
          project: {
            id: projectId,
            ...this.projectsService.editorWhereFilter(user),
          },
        },
      },
      data: input,
    });
  }

  async delete(id: string, gatewayId: string, projectId: string, user: User) {
    return this.prisma.device.delete({
      where: {
        id: id,
        gatewayId: gatewayId,
        gateway: {
          project: {
            id: projectId,
            ...this.projectsService.editorWhereFilter(user),
          },
        },
      },
    });
  }

  async deleteMany(
    input: DeleteManyDevicesDto,
    gatewayId: string,
    projectId: string,
    user: User,
  ) {
    return this.prisma.device.deleteMany({
      where: {
        id: {
          in: input.ids,
        },
        gatewayId,
        gateway: {
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
    gatewayId?: string,
    user?: User,
    needValues?: boolean,
  ) {
    const devices = await this.prisma.device.findMany({
      where: {
        gateway: {
          id: gatewayId ? gatewayId : undefined,
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
      const deviceValues = await this.getValues(devices.map((x) => x.id));

      return devices.map((x) => {
        return {
          ...x,
          values: deviceValues.get(x.id),
        };
      });
    }

    return devices;
  }

  async getValues(deviceIds: string[]): Promise<Map<string, DeviceValue[]>> {
    const valuesMap = new Map<string, DeviceValue[]>();
    for (const id of deviceIds) {
      valuesMap.set(id, []);
    }

    const cachedKeys = await this.redis.keys('/devices/*/values');
    for (const key of cachedKeys) {
      const cachedDVsString = await this.redis.get(key);
      const cachedDVs = parseJson<DeviceValue[]>(cachedDVsString, []);

      const deviceId = key.split('/')[2];
      valuesMap.set(deviceId, cachedDVs);
    }

    const notCachedIds = deviceIds.filter(
      (id) => !cachedKeys.includes(`/devices/${id}/values`),
    );
    if (notCachedIds.length) {
      const values = await this.prisma.deviceValue.findMany({
        where: {
          deviceId: {
            in: notCachedIds,
          },
        },
      });

      for (const v of values) {
        valuesMap.get(v.deviceId).push(v);
      }

      for (const id of notCachedIds) {
        await this.redis.set(
          `/devices/${id}/values`,
          JSON.stringify(valuesMap.get(id)),
        );
      }
    }

    return valuesMap;
  }

  async addValue({ deviceId, value }: AddValueDto) {
    const cachedDVsString = await this.redis.get(`/devices/${deviceId}/values`);
    let cachedDVs = parseJson<DeviceValue[]>(cachedDVsString, null);

    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      select: {
        id: true,
        values: !cachedDVs ? true : false,
      },
    });

    if (!device) {
      return;
    }

    if (cachedDVs) {
      cachedDVs.unshift({
        deviceId,
        value,
        createdAt: new Date(),
      });
      device.values = cachedDVs;
    } else {
      if (!device.values) {
        device.values = [];
      }
      device.values.unshift({
        deviceId,
        value,
        createdAt: new Date(),
      });
      cachedDVs = device.values;
    }

    await this.redis.set(
      `/devices/${deviceId}/values`,
      JSON.stringify(cachedDVs),
    );

    return device;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncCachedDVsToDb() {
    const cachedKeys = await this.redis.keys('/devices/*/values');
    const cachedDVs = await Promise.all(
      cachedKeys.map(async (key) => {
        const cachedDVsString = await this.redis.get(key);
        const parsed = parseJson<DeviceValue[]>(cachedDVsString, []).map(
          (x) => {
            if (typeof x.value !== 'string') {
              x.value = JSON.stringify(x.value);
            }
            return x;
          },
        );
        return parsed;
      }),
    );

    const values = cachedDVs.flat();
    if (values.length) {
      await this.prisma.deviceValue.createMany({
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
