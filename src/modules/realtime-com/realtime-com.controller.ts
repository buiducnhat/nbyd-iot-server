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
import { PairZDatastreamResultDto } from './dto/pair-zdatastream.dto';
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
        datastreamId: data.datastreamId,
        value: data.value,
      },
      'MQTT',
    );
  }

  @EventPattern('/gateways/+/z-datastreams/pair-result', Transport.MQTT)
  @IsPublic()
  async handlePairZDatastreamResult(
    @Ctx() ctx: MqttContext,
    @Payload() data: PairZDatastreamResultDto,
  ) {
    const gatewayId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handlePairZDatastreamResult(gatewayId, data);
  }

  @EventPattern('/gateways/+/z-datastreams/data', Transport.MQTT)
  @IsPublic()
  async handleZDatastreamData(
    @Ctx() ctx: MqttContext,
    @Payload() data: GatewayDataMqttDto,
  ) {
    const gatewayId = ctx.getTopic().split('/')[2];

    return this.realtimeComService.handleZGatewayData(
      {
        projectId: data.projectId,
        gatewayId,
        datastreamId: data.datastreamId,
        value: data.value,
      },
      'MQTT',
    );
  }
}
