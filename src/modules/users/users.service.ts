import { Injectable, Logger } from '@nestjs/common';

import { MemoryStorageFile } from '@blazity/nest-file-fastify';
import { Prisma } from '@prisma/client';

import { FilesService } from '@modules/files/files.service';

import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { PrismaService } from '@src/prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { AdminGetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly filesService: FilesService,
  ) {}

  public async adminGetPaginated(input: AdminGetUsersDto) {
    const where: Prisma.UserWhereInput = {
      OR: input.search
        ? [
            {
              firstName: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
            {
              userLogin: {
                OR: [
                  {
                    email: {
                      contains: input.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    username: {
                      contains: input.search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          ]
        : undefined,
      roles: input.roles?.length > 0 ? { hasSome: input.roles } : undefined,
    };

    const total = await this.prisma.user.count({ where: where as any });

    const items = await this.prisma.user.findMany({
      where: where as any,
      skip: input.skip,
      take: input.take,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roles: true,
        gender: true,
        dateOfBirth: true,
        phoneNumber: true,
        createdAt: true,
        avatarFile: {
          select: {
            id: true,
            name: true,
            path: true,
            mimeType: true,
            size: true,
          },
        },
        userLogin: {
          select: {
            username: true,
            email: true,
            isEmailVerified: true,
          },
        },
      },
    });

    return {
      total,
      items,
    };
  }

  public async adminGetOne(id: number | string) {
    return await this.prisma.user.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roles: true,
        gender: true,
        dateOfBirth: true,
        phoneNumber: true,
        createdAt: true,
        avatarFile: {
          select: {
            id: true,
            name: true,
            path: true,
            mimeType: true,
            size: true,
          },
        },
        userLogin: {
          select: {
            username: true,
            email: true,
            isEmailVerified: true,
          },
        },
      },
    });
  }

  public async adminCreate(input: CreateUserDto) {
    await this.prisma.user.create({
      data: input,
      include: {
        userLogin: true,
        externals: true,
        sessions: true,
      },
    });
  }

  public async adminUpdate(id: string | number, input: UpdateUserDto) {
    await this.prisma.user.update({
      where: {
        id: Number(id),
      },
      data: input,
      include: {
        userLogin: true,
        externals: true,
        sessions: true,
      },
    });
  }

  public async adminDelete(id: string | number) {
    await this.prisma.user.delete({
      where: {
        id: Number(id),
      },
    });
  }

  public async adminDeleteMany(ids: string[] | number[]) {
    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: ids.map((id) => Number(id)),
        },
      },
    });
  }

  public async updateAvatar(userId: number, file: MemoryStorageFile) {
    const uploaded = await this.cloudinaryService.uploadFile(
      file,
      'user-avatars',
    );

    const avatarFile = await this.filesService.create({
      name: uploaded.original_filename,
      path: uploaded.url,
      mimeType: uploaded.format,
      size: uploaded.bytes,
    });

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarFile: {
          connect: {
            id: avatarFile.id,
          },
        },
      },
      select: {
        avatarFile: {
          select: {
            id: true,
            name: true,
            path: true,
            mimeType: true,
            size: true,
          },
        },
      },
    });
  }
}
