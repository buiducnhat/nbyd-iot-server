import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';

import { EDeviceStatus } from '@prisma/client';

import { TIME_1_MINUTE } from '@shared/constants/time.constant';

import { DatastreamsService } from '@modules/datastreams/datastreams.service';
import { CreateHistoryDto } from '@modules/datastreams/dto/create-historty.dto';

import { PrismaService } from '@src/prisma/prisma.service';

import { DevicePingMqttDto as DeviceStatusMqttDto } from './dto/device-status-mqtt.dto';
import { RealtimeComGateway } from './realtime-com.gateway';

@Injectable()
export class RealtimeComService {
  private readonly logger = new Logger(RealtimeComService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RealtimeComGateway))
    private readonly realtimeComGateway: RealtimeComGateway,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject('MQTT_CLIENT') private readonly mqtt: ClientMqtt,
    private readonly datastreamsService: DatastreamsService,
  ) {}

  private async updateDeviceStatus(
    projectId: string,
    deviceId: string,
    status: EDeviceStatus,
    data?: DeviceStatusMqttDto,
  ) {
    const device = await this.prisma.device.findUnique({
      select: {
        metaData: true,
      },
      where: {
        id: deviceId,
        projectId,
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

  async handleDeviceStatus(
    projectId: string,
    deviceId: string,
    data: DeviceStatusMqttDto,
  ) {
    // Update the device status to online
    await this.updateDeviceStatus(
      projectId,
      deviceId,
      EDeviceStatus.ONLINE,
      data,
    );

    try {
      // Set the device status to offline after time
      this.schedulerRegistry.deleteTimeout(
        `/projects/${projectId}/devices/${deviceId}/status`,
      );
    } catch (error) {}

    const timeout = setTimeout(async () => {
      await this.updateDeviceStatus(projectId, deviceId, EDeviceStatus.OFFLINE);
    }, TIME_1_MINUTE);
    this.schedulerRegistry.addTimeout(
      `/projects/${projectId}/devices/${deviceId}/status`,
      timeout,
    );
  }

  async handleDeviceCommandData(input: CreateHistoryDto, from: 'MQTT' | 'WS') {
    if (from === 'MQTT') {
      this.realtimeComGateway.emitDeviceDataUpdate(
        input.projectId,
        input.deviceId,
        input.datastreamId,
        input.value,
      );
    } else {
      // Publish the command to the MQTT broker
      this.mqtt.emit(
        `/nbyd/projects/${input.projectId}/devices/${input.deviceId}/command`,
        {
          ...input,
        },
      );
    }

    return this.datastreamsService.createHistory(input);
  }
}
