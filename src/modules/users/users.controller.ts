import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import {
  FileInterceptor,
  MemoryStorageFile,
  UploadedFile,
} from '@blazity/nest-file-fastify';
import { User } from '@prisma/client';

import {
  ApiPaginatedRestResponse,
  ApiRestResponse,
} from '@shared/rest-response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateUserDto } from './dto/create-user.dto';
import { AdminGetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserBasicDto, UserDetailDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@JwtAuth()
@ApiBearerAuth()
@UseInterceptors(TransformResponseInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admin-paginated')
  @ApiPaginatedRestResponse(UserBasicDto)
  async adminPaginated(@Query() query: AdminGetUsersDto) {
    return this.usersService.adminGetPaginated(query);
  }

  @Get('admin-one/:id')
  @ApiRestResponse(UserDetailDto)
  async adminGet(@Param('id') id: number) {
    return this.usersService.adminGetOne(id);
  }

  @Post('admin-create')
  @ApiRestResponse(null)
  async adminCreate(@Body() input: CreateUserDto) {
    return this.usersService.adminCreate(input);
  }

  @Patch('admin-update/:id')
  @ApiRestResponse(null)
  async adminUpdate(@Param('id') id: number, @Body() input: UpdateUserDto) {
    return this.usersService.adminUpdate(id, input);
  }

  @Delete('admin-delete/:id')
  @ApiRestResponse(null)
  async adminDelete(@Param('id') id: number) {
    return this.usersService.adminDelete(id);
  }

  @Delete('admin-delete-many')
  @ApiRestResponse(null)
  async adminDeleteMany(@Body() ids: number[]) {
    return this.usersService.adminDeleteMany(ids);
  }

  @Patch('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiRestResponse(null)
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: MemoryStorageFile,
  ) {
    return this.usersService.updateAvatar(user.id, file);
  }
}
