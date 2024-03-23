import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { JwtAuthWsGuard } from '@modules/auth/guards/jwt-auth-ws.guard';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { PrismaService } from '@src/prisma/prisma.service';

import { DeviceCommandWsDto } from './dto/device-command-ws.dto';
import { JoinWsRoomProjectDto } from './dto/join-ws-room-project.dto';
import { RealtimeComService } from './realtime-com.service';

@WebSocketGateway({ cors: true })
export class RealtimeComGateway {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(RealtimeComGateway.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('MQTT_CLIENT') private readonly mqttClient: ClientMqtt,
    @Inject(forwardRef(() => RealtimeComService))
    private readonly realtimeComService: RealtimeComService,
  ) {}

  @SubscribeMessage('/ws-room/projects/join')
  @UseGuards(JwtAuthWsGuard)
  async handleJoinRoomProject(
    @ConnectedSocket() socket: Socket,
    @MessageBody() input: JoinWsRoomProjectDto,
    @CurrentUser() user: User,
  ) {
    const isProjectExisted = await this.prisma.project.count({
      where: {
        id: input.projectId,
        members: {
          some: { user: { id: user.id } },
        },
      },
    });

    if (!isProjectExisted) {
      return;
    }

    socket.join(`/projects/${input.projectId}`);
  }

  @SubscribeMessage('/ws-room/projects/leave')
  @UseGuards(JwtAuthWsGuard)
  async handleLeaveRoomProject(
    @ConnectedSocket() socket: Socket,
    @MessageBody() input: JoinWsRoomProjectDto,
  ) {
    socket.leave(`/projects/${input.projectId}`);
  }

  @SubscribeMessage('/devices/command')
  @UseGuards(JwtAuthWsGuard)
  async handleCommand(
    @ConnectedSocket() socket: Socket,
    @MessageBody() input: DeviceCommandWsDto,
    @CurrentUser() user: User,
  ) {
    // Check if the datastream is existed
    const datastream = await this.prisma.datastream.findUnique({
      where: {
        id: input.datastreamId,
        device: {
          project: {
            members: {
              some: { userId: user.id },
            },
          },
        },
      },
    });
    if (!datastream) {
      return;
    }

    // Publish the command to the MQTT broker
    this.mqttClient.emit(`/nbyd/devices/${datastream.deviceId}/command`, {
      ...input,
    });
  }

  async emitDeviceDataUpdate(
    projectId: string,
    datastreamId: string,
    value: string,
  ) {
    this.server.to(`/projects/${projectId}`).emit('/devices/data', {
      datastreamId,
      value,
    });
  }
}
