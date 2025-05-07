import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/module/users/users.service';
import { ConfigService } from '@nestjs/config';
import { ERROR } from 'src/common/constants/error.constants';

@Injectable()
export class JwtAdminGuards extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UsersService) {
    const config = new ConfigService();
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { userId: string }) {
    const user = await this.userService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException(ERROR.UnauthorizedAccess);
    }

    return user;
  }
}
