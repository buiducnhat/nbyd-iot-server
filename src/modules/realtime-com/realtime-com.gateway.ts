import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Datastream, User } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { JwtAuthWsGuard } from '@modules/auth/guards/jwt-auth-ws.guard';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { PrismaService } from '@src/prisma/prisma.service';

import { DeviceCommandWsDto } from './dto/device-command-ws.dto';
import { JoinWsRoomProjectDto } from './dto/join-ws-room-project.dto';
import { PairZDatastreamDto } from './dto/pair-zdatastream.dto';
import { RealtimeComService } from './realtime-com.service';

@WebSocketGateway({ cors: true })
export class RealtimeComGateway {
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger = new Logger(RealtimeComGateway.name);

  constructor(
    private readonly prisma: PrismaService,
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
  async handleCommand(@MessageBody() input: DeviceCommandWsDto) {
    return this.realtimeComService.handleDeviceCommandData(
      {
        projectId: input.projectId,
        deviceId: input.deviceId,
        datastreamId: input.datastreamId,
        value: input.value,
      },
      'WS',
    );
  }

  @SubscribeMessage('/z-datastreams/pair')
  @UseGuards(JwtAuthWsGuard)
  async handlePairZDatastream(
    @MessageBody() input: PairZDatastreamDto,
    @CurrentUser() user: User,
  ) {
    return this.realtimeComService.handlePairZDatastream(input, user);
  }

  async emitDeviceDataUpdate(
    projectId: string,
    deviceId: string,
    datastreamId: string,
    value: string,
  ) {
    this.server.to(`/projects/${projectId}`).emit('/devices/data', {
      deviceId,
      datastreamId,
      value,
    });
  }

  async emitPairZDatastream(data: Datastream, userId: number) {
    this.server.to(String(userId)).emit('/z-datastreams/pair-result', data);
  }
}
