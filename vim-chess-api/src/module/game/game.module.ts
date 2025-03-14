import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameGateway } from './gateway/game.gateway';
import {PrismaService} from "../../prisma/prisma.service";

@Module({
  providers: [GameGateway, GameService, PrismaService],
})
export class GameModule {}
