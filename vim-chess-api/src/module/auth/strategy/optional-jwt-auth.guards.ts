import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtOptionalStrategy extends PassportStrategy(
  Strategy,
  'jwt-optional',
) {
  constructor(
    private userService: UsersService,
    configService: ConfigService,
  ) {
    const secretOrKey = configService.get<string>('JWT_SECRET_KEY');
    if (!secretOrKey) {
      throw new UnauthorizedException('Invalid JWT_SECRET_KEY');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    });
  }

  async validate(payload: { userUid: string }) {
    if (!payload || !payload.userUid) {
      return null;
    }

    return this.userService.findOne(payload.userUid);
  }
}
