import { ApiProperty } from '@nestjs/swagger';

import { EGender, ERole } from '@prisma/client';

export class UserBasicDto {
  id: number;
  firstName: string;
  lastName?: string;
  @ApiProperty({
    enum: ERole,
    isArray: true,
  })
  roles: ERole[];
  @ApiProperty({
    enum: EGender,
    required: false,
  })
  gender?: EGender;
  dateOfBirth?: Date;
  phoneNumber?: string;
  createdAt: Date;
  avatarFile?: {
    id: number;
    name: string;
    path: string;
    mimeType: string;
    size: number;
  };
  userLogin: {
    username: string;
    email: string;
    isEmailVerified: boolean;
  };
}

export class UserDetailDto extends UserBasicDto {
  externals: any;
  sessions: any;
}
