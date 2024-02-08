import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  accessTokenExpiresIn: number;
}
