import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Device, User } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { JwtAuthWsGuard } from '@modules/auth/guards/jwt-auth-ws.guard';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { PrismaService } from '@src/prisma/prisma.service';

import { GatewayCommandWsDto } from './dto/gateway-command-ws.dto';
import { JoinWsRoomProjectDto } from './dto/join-ws-room-project.dto';
import { PairZDeviceDto } from './dto/pair-z-device.dto';
import { RealtimeComService } from './realtime-com.service';

@WebSocketGateway({ cors: true })
export class RealtimeComGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger = new Logger(RealtimeComGateway.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RealtimeComService))
    private readonly realtimeComService: RealtimeComService,
  ) {}

  handleConnection(client: Socket) {
    client.join(String(client.handshake.auth.userId));
  }

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
  async handleCommand(@MessageBody() input: GatewayCommandWsDto) {
    return this.realtimeComService.handleGatewayCommandOrData(
      {
        projectId: input.projectId,
        gatewayId: input.gatewayId,
        deviceId: input.deviceId,
        value: input.value,
      },
      'WS',
    );
  }

  @SubscribeMessage('/z-devices/pair')
  @UseGuards(JwtAuthWsGuard)
  async handlePairZDevice(
    @MessageBody() input: PairZDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.realtimeComService.handlePairZDevice(input, user);
  }

  async emitGatewayDataUpdate(
    projectId: string,
    gatewayId: string,
    deviceId: string,
    value: string,
  ) {
    this.server.to(`/projects/${projectId}`).emit('/devices/data', {
      gatewayId,
      deviceId,
      value,
    });
  }

  async emitPairZDevice(data: Device, userId: number) {
    this.server.to(String(userId)).emit('/z-devices/pair-result', data);
  }
}
