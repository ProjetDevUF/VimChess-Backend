import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthModel } from './auth.model';
import { UsersModel } from '../users/users.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtOptionalStrategy } from './strategy/optional-jwt-auth.guards';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthModel,
    UsersModel,
    UsersService,
    JwtOptionalStrategy,
    JwtService,
    ConfigService,
  ],
})
export class AuthModule {}
