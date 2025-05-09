import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthModel } from './auth.model';
import { UsersModel } from '../users/users.model';
import { ERROR } from '../../common/constants/error.constants';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly authModel: AuthModel,
    private readonly userModel: UsersModel,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  public async checkoutUserSession(uid: string, deviceId: string) {
    const auth = await this.authModel.findSessionByUserId(uid, deviceId);
    if (!auth) throw new UnauthorizedException();
    if (auth.expiresIn < new Date()) {
      await this.authModel.deleteSession(auth.id);
      throw new BadRequestException('Session expired');
    }
    return { ...auth.User, deviceId: auth.deviceId };
  }

  async login({ email, password, deviceId }: LoginDto) {
    const user = await this.userModel.findByEmail(email);
    if (!user) throw new NotFoundException(ERROR.IncorrectCredentials);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new NotFoundException(ERROR.IncorrectCredentials);
    const refreshToken = this.generateRefreshToken({ userUid: user.uid });
    await this.userModel.updateRefreshToken(user.uid, refreshToken);
    await this.authModel.createSession(user.uid, refreshToken, deviceId);
    return {
      accessToken: this.generateAccessToken({ userUid: user.uid }),
      refreshToken,
    };
  }

  async register({ password, ...userDto }: CreateUserDto) {
    const existingUser = await this.userModel.findByEmail(userDto.email);
    if (existingUser) throw new ConflictException(ERROR.AlreadyExists);
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      return this.userModel.createUser({
        password: hashedPassword,
        ...userDto,
      });
    } catch (e) {
      throw new BadRequestException(ERROR.InvalidInputFormat);
    }
  }

  generateAccessToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
    });
  }

  generateRefreshToken(payload: object) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    });
  }

  public anonymousToken(userUid: string) {
    const token = this.jwtService.sign(
      { userUid, name: 'Anonymous' },
      {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
      },
    );
    return {
      token,
      exp: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
    };
  }

  public parseToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET_KEY'),
      });
    } catch (e) {
      throw new BadRequestException('Invalid token');
    }
  }

  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET_KEY'),
      });
    } catch (error) {
      return null;
    }
  }

  public async refreshToken(token: string) {
    const payload: { userUid: string } = this.validateToken(token);
    if (!payload) throw new NotFoundException(ERROR.InvalidToken);

    const user = await this.userModel.findOneByUid(payload.userUid);
    if (!user) throw new NotFoundException(ERROR.InvalidToken);

    const accessToken = this.generateAccessToken({ userUid: user.uid });
    const refreshToken = this.generateRefreshToken({ userUid: user.uid });

    await this.authModel.updateRefreshToken(user, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }
}
