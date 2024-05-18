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
import { PairZDatastreamResultDto } from './dto/pair-zdatastream.dto';
import { RealtimeComService } from './realtime-com.service';

@Controller('realtime-com')
export class RealtimeComController {
  constructor(private readonly realtimeComService: RealtimeComService) {}

  @EventPattern('/devices/+/status', Transport.MQTT)
  @IsPublic()
  async handleDevicePing(
    @Ctx() ctx: MqttContext,
    @Payload() data: DevicePingMqttDto,
  ) {
    const deviceId = ctx.getTopic().split('/')[4];

    return this.realtimeComService.handleDeviceStatus(deviceId, data);
  }

  @EventPattern('/devices/+/data', Transport.MQTT)
  @IsPublic()
  async handleDeviceData(
    @Ctx() ctx: MqttContext,
    @Payload() data: DeviceDataMqttDto,
  ) {
    const deviceId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handleDeviceCommandData(
      {
        projectId: data.projectId,
        deviceId,
        datastreamId: data.datastreamId,
        value: data.value,
      },
      'MQTT',
    );
  }

  @EventPattern('/devices/+/z-datastreams/pair-result', Transport.MQTT)
  @IsPublic()
  async handlePairZDatastreamResult(
    @Ctx() ctx: MqttContext,
    @Payload() data: PairZDatastreamResultDto,
  ) {
    const deviceId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handlePairZDatastreamResult(deviceId, data);
  }

  @EventPattern('/devices/+/z-datastreams/data', Transport.MQTT)
  @IsPublic()
  async handleZDatastreamData(
    @Ctx() ctx: MqttContext,
    @Payload() data: DeviceDataMqttDto,
  ) {
    const deviceId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handleZDeviceData(
      {
        projectId: data.projectId,
        deviceId,
        datastreamId: data.datastreamId,
        value: data.value,
      },
      'MQTT',
    );
  }
}
