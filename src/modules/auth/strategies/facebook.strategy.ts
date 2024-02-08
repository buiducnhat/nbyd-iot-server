import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Profile, Strategy } from 'passport-facebook';

import { TAuthConfig } from '@configs/auth.config';

import { AuthService } from '@modules/auth/auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService<TAuthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('facebookAppId'),
      clientSecret: configService.get('facebookAppSecretKey'),
      callbackURL: 'http://localhost:4000/facebook/redirect',
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
