import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ERROR } from '../../common/constants/error.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() register: CreateUserDto) {
    return this.authService.register(register);
  }

  @Post('refresh-token')
  async refreshToken(@Body() payload: RefreshTokenDto) {
    try {
      return await this.authService.refreshToken(payload.refreshToken);
    } catch (e) {
      throw new UnauthorizedException(ERROR.InvalidToken);
    }
  }
}
