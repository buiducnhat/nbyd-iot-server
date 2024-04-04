import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

import { EDeviceStatus } from '@prisma/client';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';

import { TIME_1_MINUTE } from '@shared/constants/time.constant';

import { PrismaService } from '@src/prisma/prisma.service';

import { DevicePingMqttDto } from './dto/device-ping-mqtt.dto';
import { RealtimeComGateway } from './realtime-com.gateway';

@Injectable()
export class RealtimeComService {
  private readonly logger = new Logger(RealtimeComService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RealtimeComGateway))
    private readonly realtimeComGateway: RealtimeComGateway,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private async updateDeviceStatus(
    deviceId: string,
    status: EDeviceStatus,
    data?: DevicePingMqttDto,
  ) {
    const device = await this.prisma.device.findUnique({
      select: {
        metaData: true,
      },
      where: {
        id: deviceId,
      },
    });
    if (!device) {
      return;
    }

    if (!device.metaData) {
      device.metaData = { ...data?.metaData };
    } else {
      device.metaData = {
        ...device.metaData,
        ...data?.metaData,
      };
    }

    return this.prisma.device.update({
      data: {
        status,
        lastOnline: status === 'ONLINE' ? new Date() : undefined,
        metaData: device.metaData,
      },
      where: {
        id: deviceId,
      },
    });
  }

  async handleDevicePing(deviceId: string, data: DevicePingMqttDto) {
    // Update the device status to online
    await this.updateDeviceStatus(deviceId, EDeviceStatus.ONLINE, data);

    try {
      // Set the device status to offline after time
      this.schedulerRegistry.deleteTimeout(`/devices/${deviceId}/ping`);
    } catch (error) {}

    const timeout = setTimeout(async () => {
      await this.updateDeviceStatus(deviceId, EDeviceStatus.OFFLINE);
    }, TIME_1_MINUTE);
    this.schedulerRegistry.addTimeout(`/devices/${deviceId}/ping`, timeout);
  }

  async handleDeviceData(
    deviceId: string,
    datastreamId: string,
    value: string,
  ) {
    try {
      const dsHis = await this.prisma.datastreamHistory.create({
        data: {
          value,
          datastream: {
            connect: {
              id: datastreamId,
              device: {
                id: deviceId,
              },
            },
          },
        },
        select: {
          datastream: {
            select: {
              id: true,
              enabledHistory: true,
              device: {
                select: {
                  projectId: true,
                },
              },
            },
          },
        },
      });
      // Send the datastream value to the connected ws clients
      this.realtimeComGateway.emitDeviceDataUpdate(
        dsHis.datastream.device.projectId,
        datastreamId,
        value,
      );
    } catch (error) {
      if (error instanceof PrismaClientUnknownRequestError) {
        throw error;
      }
    }
  }

  // DELETE old data, but keep the latest 1 record (by createdAt field)
  @Cron(CronExpression.EVERY_HOUR)
  async deleteOldDeviceDatastreamHistory() {
    let dhs = await this.prisma.datastreamHistory.groupBy({
      by: ['datastreamId'],
      _max: {
        createdAt: true,
      },
    });

    dhs = dhs.filter((dh) => dh._max.createdAt);

    await this.prisma.datastreamHistory.deleteMany({
      where: {
        OR: dhs.map((ds) => ({
          datastreamId: ds.datastreamId,
          createdAt: {
            lt: ds._max.createdAt,
          },
        })),
      },
    });
  }
}
