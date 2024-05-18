import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MqttContext,
  Payload,
  Transport,
} from '@nestjs/microservices';

import { IsPublic } from '@src/decorators/is-public.decorator';

import { GatewayDataMqttDto } from './dto/gateway-data-mqtt.dto';
import { GatewayPingMqttDto } from './dto/gateway-status-mqtt.dto';
import { PairZDeviceResultDto } from './dto/pair-z-device.dto';
import { RealtimeComService } from './realtime-com.service';

@Controller('realtime-com')
export class RealtimeComController {
  constructor(private readonly realtimeComService: RealtimeComService) {}

  @EventPattern('/gateways/+/status', Transport.MQTT)
  @IsPublic()
  async handleGatewayPing(
    @Ctx() ctx: MqttContext,
    @Payload() data: GatewayPingMqttDto,
  ) {
    const gatewayId = ctx.getTopic().split('/')[4];

    return this.realtimeComService.handleGatewayStatus(gatewayId, data);
  }

  @EventPattern('/gateways/+/data', Transport.MQTT)
  @IsPublic()
  async handleGatewayData(
    @Ctx() ctx: MqttContext,
    @Payload() data: GatewayDataMqttDto,
  ) {
    const gatewayId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handleGatewayCommandData(
      {
        projectId: data.projectId,
        gatewayId,
        deviceId: data.deviceId,
        value: data.value,
      },
      'MQTT',
    );
  }

  @EventPattern('/gateways/+/z-devices/pair-result', Transport.MQTT)
  @IsPublic()
  async handlePairZDeviceResult(
    @Ctx() ctx: MqttContext,
    @Payload() data: PairZDeviceResultDto,
  ) {
    const gatewayId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handlePairZDeviceResult(gatewayId, data);
  }

  @EventPattern('/gateways/+/z-devices/data', Transport.MQTT)
  @IsPublic()
  async handleZDeviceData(
    @Ctx() ctx: MqttContext,
    @Payload() data: GatewayDataMqttDto,
  ) {
    const gatewayId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handleZGatewayData(
      {
        projectId: data.projectId,
        gatewayId,
        deviceId: data.deviceId,
        value: data.value,
      },
      'MQTT',
    );
  }
}
