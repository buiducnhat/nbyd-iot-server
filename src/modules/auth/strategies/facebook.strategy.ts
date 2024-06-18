import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Profile, Strategy } from 'passport-facebook';

import { TAppConfig } from '@configs/app.config';
import { TAuthConfig } from '@configs/auth.config';
import { TConfigs } from '@configs/index';

import { AuthService } from '@modules/auth/auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService<TConfigs>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<TAuthConfig>('auth').facebookAppId,
      clientSecret: configService.get<TAuthConfig>('auth').facebookAppSecretKey,
      callbackURL: `${configService.get<TAppConfig>('app').baseUrl}/${configService.get<TAppConfig>('app').apiPrefix}/auth/facebook/redirect`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, result: any, info?: any) => void,
  ): Promise<any> {
    const result = profile;

    done(null, result);
  }
}
