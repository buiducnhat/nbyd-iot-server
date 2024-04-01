import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { EDeviceStatus } from '@prisma/client';

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
    // Update the last value of the datastream to database
    const datastream = await this.prisma.datastream.update({
      select: {
        device: {
          select: {
            projectId: true,
          },
        },
      },
      data: {
        lastValue: value,
      },
      where: {
        id: datastreamId,
        device: {
          id: deviceId,
        },
      },
    });

    // Send the datastream value to the connected ws clients
    this.realtimeComGateway.emitDeviceDataUpdate(
      datastream.device.projectId,
      datastreamId,
      value,
    );
  }
}
