import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { GameModel } from './game.model';
import { ClientStore } from './ClientStore';
import { ConnectionPatchProvider } from './connection.provider';
import { GameList } from './game.list';
import { AuthService } from '../auth';
import { AuthModel } from '../auth/auth.model';
import { UsersModel } from '../users/users.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GameAdapter } from './entities/game/game.adapter';

@Module({
  providers: [
    GameGateway,
    GameService,
    PrismaService,
    GameModel,
    ClientStore,
    ConnectionPatchProvider,
    GameList,
    AuthService,
    AuthModel,
    UsersModel,
    JwtService,
    ConfigService,
    {
      provide: 'GameAdapterI',
      useClass: GameAdapter,
    },
  ],
})
export class GameModule {}
