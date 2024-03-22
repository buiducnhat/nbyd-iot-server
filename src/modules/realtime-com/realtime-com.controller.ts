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

  @EventPattern('/nbyd/devices/+/status', Transport.MQTT)
  @IsPublic()
  async handleDeviceStatus(@Ctx() ctx: MqttContext) {
    const deviceId = ctx.getTopic().split('/')[3];

    this.realtimeComService.updateDeviceStatus(deviceId, 'ONLINE');
  }

  @EventPattern('/nbyd/devices/+/data', Transport.MQTT)
  @IsPublic()
  async handleDeviceData(
    @Ctx() ctx: MqttContext,
    @Payload() data: DeviceDataMqttDto,
  ) {
    const deviceId = ctx.getTopic().split('/')[3];

    this.realtimeComService.updateDeviceData(
      deviceId,
      data.datastreamId,
      data.value,
    );
  }
}
