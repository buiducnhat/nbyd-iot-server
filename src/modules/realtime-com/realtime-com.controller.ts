import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MqttContext,
  Payload,
  Transport,
} from '@nestjs/microservices';

import { IsPublic } from '@src/decorators/is-public.decorator';

import { DeviceDataMqttDto } from './dto/device-data-mqtt.dto';
import { DevicePingMqttDto } from './dto/device-status-mqtt.dto';
import { RealtimeComService } from './realtime-com.service';

@Controller('realtime-com')
export class RealtimeComController {
  constructor(private readonly realtimeComService: RealtimeComService) {}

  @EventPattern('/projects/+/devices/+/status', Transport.MQTT)
  @IsPublic()
  async handleDevicePing(
    @Ctx() ctx: MqttContext,
    @Payload() data: DevicePingMqttDto,
  ) {
    const projectId = ctx.getTopic().split('/')[2];
    const deviceId = ctx.getTopic().split('/')[4];

    return this.realtimeComService.handleDeviceStatus(
      projectId,
      deviceId,
      data,
    );
  }

  @EventPattern('/projects/+/devices/+/data', Transport.MQTT)
  @IsPublic()
  async handleDeviceData(
    @Ctx() ctx: MqttContext,
    @Payload() data: DeviceDataMqttDto,
  ) {
    const projectId = ctx.getTopic().split('/')[2];
    const deviceId = ctx.getTopic().split('/')[4];

    return this.realtimeComService.handleDeviceCommandData(
      {
        projectId,
        deviceId,
        datastreamId: data.datastreamId,
        value: data.value,
      },
      'MQTT',
    );
  }
}
