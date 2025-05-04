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
import { LoggerService } from '../../common/filters/logger';
import { GameManagementService } from './services/GameMagement.service';
import { GameActionService } from './services/GameAction.service';
import { GameSaveService } from './services/GameSave.service';

@Module({
  providers: [
    GameGateway,
    GameService,
    GameManagementService,
    GameActionService,
    GameSaveService,
    PrismaService,
    GameModel,
    ClientStore,
    ConnectionPatchProvider,
    GameList,
    AuthService,
    AuthModel,
    UsersModel,
    LoggerService,
    JwtService,
    ConfigService,
    {
      provide: 'GameAdapterI',
      useClass: GameAdapter,
    },
  ],
})
export class GameModule {}
