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
  ApiPaginatedResponse,
  ApiResponse,
  ApiUpdatedResponse,
} from '@shared/rest-response';

import { CurrentUser } from '@src/decorators/current-user.decorator';
import { JwtAuth } from '@src/decorators/jwt-auth.decorator';
import { TransformResponseInterceptor } from '@src/interceptors/transform-response.interceptor';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteManyUsersDto } from './dto/delete-many-users.dto';
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
  @ApiPaginatedResponse(UserBasicDto)
  async adminPaginated(@Query() query: AdminGetUsersDto) {
    return this.usersService.adminGetPaginated(query);
  }

  @Get('admin-one/:id')
  @ApiResponse(UserDetailDto)
  async adminGet(@Param('id') id: number) {
    return this.usersService.adminGetOne(id);
  }

  @Post('admin-create')
  @ApiResponse(UserBasicDto)
  async adminCreate(@Body() input: CreateUserDto) {
    return this.usersService.adminCreate(input);
  }

  @Patch('admin-update/:id')
  @ApiResponse(UserBasicDto)
  async adminUpdate(@Param('id') id: number, @Body() input: UpdateUserDto) {
    return this.usersService.adminUpdate(id, input);
  }

  @Delete('admin-delete/:id')
  @ApiUpdatedResponse()
  async adminDelete(@Param('id') id: number) {
    return this.usersService.adminDelete(id);
  }

  @Delete('admin-delete-many')
  @ApiUpdatedResponse()
  async adminDeleteMany(@Body() input: DeleteManyUsersDto) {
    return this.usersService.adminDeleteMany(input);
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
  @ApiResponse(UserBasicDto)
  @UseInterceptors(FileInterceptor('file'))
  async changeAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: MemoryStorageFile,
  ) {
    return this.usersService.updateAvatar(user.id, file);
  }
}
