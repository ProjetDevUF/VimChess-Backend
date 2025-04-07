import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthModel } from './auth.model';
import { UsersModel } from '../users/users.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthModel, UsersModel, JwtService, ConfigService],
})
export class AuthModule {}
