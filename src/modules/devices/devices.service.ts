import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { Device, DeviceValue, User } from '@prisma/client';
import Redis from 'ioredis';

import { parseJson } from '@shared/helpers/parse-json.helper';

import { ProjectsService } from '@modules/projects/projects.service';
import { RealtimeComService } from '@modules/realtime-com/realtime-com.service';

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
    @Inject(RealtimeComService)
    private readonly realtimeComService: RealtimeComService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(
    input: CreateDeviceDto,
    gatewayId: string,
    projectId: string,
    user: User,
  ) {
    const result = await this.prisma.device.create({
      data: {
        ...input,
        dataType:
          input.dataType || (input.type === 'ZIGBEE' ? 'JSON' : 'STRING'),
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

    this.realtimeComService.requestGatewayRefetch(gatewayId);

    return result;
  }

  async update(
    input: UpdateDeviceDto,
    id: string,
    gatewayId: string,
    projectId: string,
    user: User,
  ) {
    const result = await this.prisma.device.update({
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

    // Request gateway refetch to update the device list
    this.realtimeComService.requestGatewayRefetch(gatewayId);

    // Update the cache
    this.redis.del(`/devices/${id}`);

    return result;
  }

  async delete(id: string, gatewayId: string, projectId: string, user: User) {
    const device = await this.prisma.device.delete({
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

    // Remove the device from z2m
    if (device.type === 'ZIGBEE') {
      this.realtimeComService.removeZDevice(device.id, gatewayId);
    }

    // Request gateway refetch to update the device list
    this.realtimeComService.requestGatewayRefetch(gatewayId);

    // Update the cache
    this.redis.del(`/devices/${id}`);

    return device;
  }

  async deleteMany(
    input: DeleteManyDevicesDto,
    gatewayId: string,
    projectId: string,
    user: User,
  ) {
    const result = await this.prisma.device.deleteMany({
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

    this.realtimeComService.requestGatewayRefetch(gatewayId);

    return result;
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
      include: {
        gateway: {
          select: {
            id: true,
            name: true,
          },
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
    //#region Get device {id, enabledHistory} from the cache
    const cachedDeviceStr = await this.redis.get(`/devices/${deviceId}`);
    let device = parseJson<Partial<Device>>(cachedDeviceStr, null);
    if (!device) {
      device = await this.prisma.device.findUnique({
        where: { id: deviceId },
        select: {
          id: true,
          enabledHistory: true,
        },
      });
      await this.redis.set(`/devices/${deviceId}`, JSON.stringify(device));
    }
    //#endregion

    //#region Get cached values and add new value based on the device's enabledHistory
    const cachedValuesStr = await this.redis.get(`/devices/${deviceId}/values`);
    let cachedValues = parseJson<DeviceValue[]>(cachedValuesStr, []) || [];
    if (device.enabledHistory) {
      cachedValues.unshift({
        deviceId,
        value,
        createdAt: new Date(),
      });
    } else {
      cachedValues = [
        {
          deviceId,
          value,
          createdAt: new Date(),
        },
      ];
    }

    // Set the new cached values
    await this.redis.set(
      `/devices/${deviceId}/values`,
      JSON.stringify(cachedValues),
    );
    //#endregion
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncCachedValuesToDb() {
    //#region Get all cached values
    const cachedKeys = await this.redis.keys('/devices/*/values');
    const cachedAllValues = await Promise.all(
      cachedKeys.map(async (key) => {
        const cachedValues = await this.redis.get(key);
        const parsed = parseJson<DeviceValue[]>(cachedValues, [])?.map((x) => {
          if (typeof x.value !== 'string') {
            x.value = JSON.stringify(x.value);
          }
          return x;
        });
        return parsed;
      }),
    );
    //#endregion

    const values = cachedAllValues.flat();
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
