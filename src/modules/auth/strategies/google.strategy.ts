import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { TAppConfig } from '@configs/app.config';
import { TAuthConfig } from '@configs/auth.config';
import { TConfigs } from '@configs/index';

import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService<TConfigs>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<TAuthConfig>('auth').googleAppId,
      clientSecret: configService.get<TAuthConfig>('auth').googleAppSecretKey,
      callbackURL: `${configService.get<TAppConfig>('app').baseUrl}/${configService.get<TAppConfig>('app').apiPrefix}/auth/google/redirect`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.authService.loginWithExternal({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      provider: 'GOOGLE',
      providerId: profile.id,
      avatarImageFileUrl: profile.photos?.[0].value || undefined,
    });

    return done(null, user);
  }
}
