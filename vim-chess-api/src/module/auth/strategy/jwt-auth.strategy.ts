import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR } from 'src/common/constants/error.constants';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt-optional') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (!err && user) {
      return user;
    }

    return null;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw new UnauthorizedException(ERROR.UnauthorizedAccess);
    }
    return user;
  }
}
