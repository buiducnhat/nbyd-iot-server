import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { EGatewayStatus, User } from '@prisma/client';
import { Redis } from 'ioredis';
import * as uuid from 'uuid';

import {
  PAIR_Z_DATASTREAM_TIMEOUT,
  TIME_1_MINUTE,
} from '@shared/constants/time.constant';
import { parseJson } from '@shared/helpers/parse-json.helper';

import { DevicesService } from '@modules/devices/devices.service';
import { AddValueDto } from '@modules/devices/dto/add-value.dto';

import { PrismaService } from '@src/prisma/prisma.service';

import { GatewayPingMqttDto as GatewayStatusMqttDto } from './dto/gateway-status-mqtt.dto';
import { PairZDeviceDto, PairZDeviceResultDto } from './dto/pair-z-device.dto';
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
    private readonly devicesService: DevicesService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private async updateGatewayStatus(
    gatewayId: string,
    status: EGatewayStatus,
    data?: GatewayStatusMqttDto,
  ) {
    const gateway = await this.prisma.gateway.findUnique({
      select: {
        metaData: true,
      },
      where: {
        id: gatewayId,
      },
    });
    if (!gateway) {
      return;
    }

    if (!gateway.metaData) {
      gateway.metaData = { ...data?.metaData };
    } else {
      gateway.metaData = {
        ...gateway.metaData,
        ...data?.metaData,
      };
    }

    return this.prisma.gateway.update({
      data: {
        status,
        lastOnline: status === 'ONLINE' ? new Date() : undefined,
        metaData: gateway.metaData,
      },
      where: {
        id: gatewayId,
      },
    });
  }

  async handleGatewayStatus(gatewayId: string, data: GatewayStatusMqttDto) {
    // Update the gateway status to online
    await this.updateGatewayStatus(gatewayId, EGatewayStatus.ONLINE, data);

    try {
      // Set the gateway status to offline after time
      this.schedulerRegistry.deleteTimeout(`/gateways/${gatewayId}/status`);
    } catch (error) {}

    const timeout = setTimeout(async () => {
      await this.updateGatewayStatus(gatewayId, EGatewayStatus.OFFLINE);
    }, TIME_1_MINUTE);
    this.schedulerRegistry.addTimeout(`/gateways/${gatewayId}/status`, timeout);
  }

  async handleGatewayCommandData(input: AddValueDto, from: 'MQTT' | 'WS') {
    if (from === 'MQTT') {
      this.realtimeComGateway.emitGatewayDataUpdate(
        input.projectId,
        input.gatewayId,
        input.deviceId,
        input.value,
      );
    } else {
      // Publish the command to the MQTT broker
      this.mqtt.emit(`/gateways/${input.gatewayId}/command`, {
        deviceId: input.deviceId,
        value: input.value,
      });
    }

    return this.devicesService.addValue(input);
  }

  async handlePairZDevice(input: PairZDeviceDto, user: User) {
    const transaction = uuid.v4();

    if (input.value) {
      // CASE: pair request
      const gateway = await this.prisma.gateway.findUnique({
        where: {
          id: input.gatewayId,
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

      if (!gateway) {
        return;
      }

      this.mqtt.emit(`/gateways/${gateway.id}/z-devices/pair`, {
        value: true,
        time: PAIR_Z_DATASTREAM_TIMEOUT,
        transaction,
      });
      await this.redis.set(
        `/gateways/${input.gatewayId}/z-devices/pair/`,
        JSON.stringify({
          ...input,
          userId: user.id,
        }),
        'EX',
        PAIR_Z_DATASTREAM_TIMEOUT,
      );
    } else {
      // CASE: pair cancel
      await this.redis.del(`/gateways/${input.gatewayId}/z-devices/pair/`);
      this.mqtt.emit(`/gateways/${input.gatewayId}/z-devices/pair`, {
        value: false,
        time: PAIR_Z_DATASTREAM_TIMEOUT,
        transaction,
      });
    }
  }

  async handlePairZDeviceResult(
    gatewayId: string,
    input: PairZDeviceResultDto,
  ) {
    const cachedStr = await this.redis.get(
      `/gateways/${gatewayId}/z-devices/pair/`,
    );
    const cached = parseJson<PairZDeviceDto & { userId: number }>(
      cachedStr,
      null,
    );

    if (!cached) {
      return;
    }

    const device = await this.prisma.device.create({
      data: {
        mac: input.mac,
        name: cached.name,
        type: 'ZIGBEE',
        pin: cached.pin.toString(),
        color: cached.color,
        gateway: {
          connect: {
            id: cached.gatewayId,
          },
        },
      },
    });

    this.realtimeComGateway.emitPairZDevice(device, cached.userId);
  }

  async handleZGatewayData(input: AddValueDto, from: 'MQTT' | 'WS') {
    if (from === 'MQTT') {
      this.realtimeComGateway.emitGatewayDataUpdate(
        input.projectId,
        input.gatewayId,
        input.deviceId,
        input.value,
      );
    } else {
      // Publish the command to the MQTT broker
      this.mqtt.emit(`/gateways/${input.gatewayId}/command`, {
        deviceId: input.deviceId,
        value: input.value,
      });
    }

    // return this.devicesService.addValue(input);
  }
}
