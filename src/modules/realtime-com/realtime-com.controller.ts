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
import { RealtimeComService } from './realtime-com.service';

@Controller('realtime-com')
export class RealtimeComController {
  constructor(private readonly realtimeComService: RealtimeComService) {}

  @EventPattern('/nbyd/devices/+/ping', Transport.MQTT)
  @IsPublic()
  async handleDevicePing(@Ctx() ctx: MqttContext) {
    const deviceId = ctx.getTopic().split('/')[3];

    return this.realtimeComService.handleDevicePing(deviceId);
  }

  @EventPattern('/nbyd/devices/+/data', Transport.MQTT)
  @IsPublic()
  async handleDeviceData(
    @Ctx() ctx: MqttContext,
    @Payload() data: DeviceDataMqttDto,
  ) {
    const deviceId = ctx.getTopic().split('/')[3];

    return this.realtimeComService.handleDeviceData(
      deviceId,
      data.datastreamId,
      data.value,
    );
  }
}
