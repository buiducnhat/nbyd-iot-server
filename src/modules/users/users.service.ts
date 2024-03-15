import { Injectable, Logger } from '@nestjs/common';

import { MemoryStorageFile } from '@blazity/nest-file-fastify';
import { Prisma } from '@prisma/client';

import { PaginatedData } from '@shared/paginated';

import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';

import { PrismaService } from '@src/prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteManyUsersDto } from './dto/delete-many-users.dto';
import { AdminGetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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
      include: {
        userLogin: {
          select: {
            username: true,
            email: true,
            isEmailVerified: true,
          },
        },
      },
    });

    return new PaginatedData(total, items);
  }

  public async adminGetOne(id: number) {
    return await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        userLogin: true,
        externals: true,
        sessions: true,
      },
    });
  }

  public async adminCreate(input: CreateUserDto) {
    return await this.prisma.user.create({
      data: input,
      include: {
        userLogin: true,
        externals: true,
        sessions: true,
      },
    });
  }

  public async adminUpdate(id: number, input: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: input,
      include: {
        userLogin: true,
        externals: true,
        sessions: true,
      },
    });
  }

  public async adminDelete(id: number) {
    return await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  public async adminDeleteMany(input: DeleteManyUsersDto) {
    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: input.ids,
        },
      },
    });
  }

  public async updateAvatar(userId: number, file: MemoryStorageFile) {
    const uploaded = await this.cloudinaryService.uploadFile(
      file,
      'users/avatars',
    );

    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarimageFileId: uploaded.public_id,
        avatarimageFileUrl: uploaded.public_id,
      },
      include: {
        externals: true,
        sessions: true,
        userLogin: true,
      },
    });
  }
}
