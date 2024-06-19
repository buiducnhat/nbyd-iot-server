import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Profile, Strategy } from 'passport-github2';

import { TAppConfig } from '@configs/app.config';
import { TAuthConfig } from '@configs/auth.config';
import { TConfigs } from '@configs/index';

import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService<TConfigs>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<TAuthConfig>('auth').githubAppId,
      clientSecret: configService.get<TAuthConfig>('auth').githubAppSecretKey,
      callbackURL: `${configService.get<TAppConfig>('app').baseUrl}/${configService.get<TAppConfig>('app').apiPrefix}/auth/github/redirect`,
      scope: ['read:user', 'user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const user = await this.authService.loginWithExternal({
      firstName: profile.displayName.split(' ')[0],
      lastName: profile.displayName.split(' ')?.slice(-1)?.[0],
      provider: 'GITHUB',
      providerId: profile.id,
      avatarImageFileUrl: profile.photos?.[0].value || undefined,
    });

    return done(null, user);
  }
}
