import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import * as firebase from 'firebase-admin';
import {
  Notification,
  NotificationMessagePayload,
} from 'firebase-admin/lib/messaging/messaging-api';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateFcmTokenDto } from './dto/create-fcm-token.dto';
import { DeleteFcmTokenDto } from './dto/delete-fcm-token.dto';

@Injectable()
export class FcmService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateFcmTokenDto, user: User) {
    // Check exists
    const fcmToken = await this.prisma.fcmToken.findUnique({
      where: {
        token_userId: {
          token: input.token,
          userId: user.id,
        },
      },
    });

    if (fcmToken) {
      return fcmToken;
    }

    return this.prisma.fcmToken.create({
      data: {
        ...input,
        user: {
          connect: { id: user.id },
        },
      },
    });
  }

  async deleteToken(input: DeleteFcmTokenDto, user: User) {
    return this.prisma.fcmToken.delete({
      where: {
        token_userId: {
          token: input.token,
          userId: user.id,
        },
      },
    });
  }

  async deleteManyTokens(userId: number, tokens?: string[]) {
    return this.prisma.fcmToken.deleteMany({
      where: {
        token: {
          in: tokens,
        },
        user: { id: userId },
      },
    });
  }

  async send(
    tokens: string[],
    notification: Notification,
    data?: { [key: string]: string },
  ) {
    await firebase.messaging().sendEachForMulticast({
      tokens,
      notification,
      data,
    });
  }

  async sendToTopic(
    topic: string,
    notification: NotificationMessagePayload,
    data?: { [key: string]: string },
  ) {
    await firebase.messaging().sendToTopic(topic, {
      notification,
      data,
    });
  }
}
