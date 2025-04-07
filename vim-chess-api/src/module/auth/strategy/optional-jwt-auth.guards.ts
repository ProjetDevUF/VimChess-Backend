import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/module/user/user.service';

@Injectable()
export class JwtOptionalStrategy extends PassportStrategy(
  Strategy,
  'jwt-optional',
) {
  constructor(
    private userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { userId: string }) {
    if (!payload || !payload.userId) {
      return null;
    }

    return this.userService.findOne(payload.userId);
  }
}
