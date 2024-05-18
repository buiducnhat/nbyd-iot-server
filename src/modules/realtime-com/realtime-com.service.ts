import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { EDeviceStatus, User } from '@prisma/client';
import { Redis } from 'ioredis';
import * as uuid from 'uuid';

import {
  PAIR_Z_DATASTREAM_TIMEOUT,
  TIME_1_MINUTE,
} from '@shared/constants/time.constant';
import { parseJson } from '@shared/helpers/parse-json.helper';

import { DatastreamsService } from '@modules/datastreams/datastreams.service';
import { AddValueDto } from '@modules/datastreams/dto/add-value.dto';

import { PrismaService } from '@src/prisma/prisma.service';

import { DevicePingMqttDto as DeviceStatusMqttDto } from './dto/device-status-mqtt.dto';
import {
  PairZDatastreamDto,
  PairZDatastreamResultDto,
} from './dto/pair-zdatastream.dto';
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
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private async updateDeviceStatus(
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

  async handleDeviceStatus(deviceId: string, data: DeviceStatusMqttDto) {
    // Update the device status to online
    await this.updateDeviceStatus(deviceId, EDeviceStatus.ONLINE, data);

    try {
      // Set the device status to offline after time
      this.schedulerRegistry.deleteTimeout(`/devices/${deviceId}/status`);
    } catch (error) {}

    const timeout = setTimeout(async () => {
      await this.updateDeviceStatus(deviceId, EDeviceStatus.OFFLINE);
    }, TIME_1_MINUTE);
    this.schedulerRegistry.addTimeout(`/devices/${deviceId}/status`, timeout);
  }

  async handleDeviceCommandData(input: AddValueDto, from: 'MQTT' | 'WS') {
    if (from === 'MQTT') {
      this.realtimeComGateway.emitDeviceDataUpdate(
        input.projectId,
        input.deviceId,
        input.datastreamId,
        input.value,
      );
    } else {
      // Publish the command to the MQTT broker
      this.mqtt.emit(`/devices/${input.deviceId}/command`, {
        datastreamId: input.datastreamId,
        value: input.value,
      });
    }

    return this.datastreamsService.addValue(input);
  }

  async handlePairZDatastream(input: PairZDatastreamDto, user: User) {
    const transaction = uuid.v4();

    if (input.value) {
      // CASE: pair request
      const device = await this.prisma.device.findUnique({
        where: {
          id: input.deviceId,
          project: {
            id: input.projectId,
            members: {
              some: {
                userId: user.id,
                role: {
                  in: ['OWNER', 'DEVELOPER'],
                },
              },
            },
          },
        },
      });

      if (!device) {
        return;
      }

      this.mqtt.emit(`/devices/${device.id}/z-datastreams/pair`, {
        value: true,
        time: PAIR_Z_DATASTREAM_TIMEOUT,
        transaction,
      });
      await this.redis.set(
        `/devices/${input.deviceId}/z-datastreams/pair/`,
        JSON.stringify({
          ...input,
          userId: user.id,
        }),
        'EX',
        PAIR_Z_DATASTREAM_TIMEOUT,
      );
    } else {
      // CASE: pair cancel
      await this.redis.del(`/devices/${input.deviceId}/z-datastreams/pair/`);
      this.mqtt.emit(`/devices/${input.deviceId}/z-datastreams/pair`, {
        value: false,
        time: PAIR_Z_DATASTREAM_TIMEOUT,
        transaction,
      });
    }
  }

  async handlePairZDatastreamResult(
    deviceId: string,
    input: PairZDatastreamResultDto,
  ) {
    const cachedStr = await this.redis.get(
      `/devices/${deviceId}/z-datastreams/pair/`,
    );
    const cached = parseJson<PairZDatastreamDto & { userId: number }>(
      cachedStr,
      null,
    );

    if (!cached) {
      return;
    }

    const datastream = await this.prisma.datastream.create({
      data: {
        mac: input.mac,
        name: cached.name,
        type: 'ZIGBEE',
        pin: cached.pin.toString(),
        color: cached.color,
        device: {
          connect: {
            id: cached.deviceId,
          },
        },
      },
    });

    this.realtimeComGateway.emitPairZDatastream(datastream, cached.userId);
  }

  async handleZDeviceData(input: AddValueDto, from: 'MQTT' | 'WS') {
    if (from === 'MQTT') {
      this.realtimeComGateway.emitDeviceDataUpdate(
        input.projectId,
        input.deviceId,
        input.datastreamId,
        input.value,
      );
    } else {
      // Publish the command to the MQTT broker
      this.mqtt.emit(`/devices/${input.deviceId}/command`, {
        datastreamId: input.datastreamId,
        value: input.value,
      });
    }

    // return this.datastreamsService.addValue(input);
  }
}
