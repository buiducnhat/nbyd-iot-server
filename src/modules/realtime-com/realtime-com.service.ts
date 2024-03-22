import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';

import { EDeviceStatus } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';

import { RealtimeComGateway } from './realtime-com.gateway';

@Injectable()
export class RealtimeComService {
  private readonly logger = new Logger(RealtimeComService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RealtimeComGateway))
    private readonly realtimeComGateway: RealtimeComGateway,
  ) {}

  async updateDeviceStatus(deviceId: string, status: EDeviceStatus) {
    await this.prisma.device.update({
      data: {
        status,
      },
      where: {
        id: deviceId,
      },
    });
  }

  async updateDeviceData(
    deviceId: string,
    datastreamId: string,
    value: string,
  ) {
    // Update the last value of the datastream to database
    await this.prisma.datastream.update({
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
    this.realtimeComGateway.emitDeviceDataUpdate(deviceId, datastreamId, value);
  }
}
