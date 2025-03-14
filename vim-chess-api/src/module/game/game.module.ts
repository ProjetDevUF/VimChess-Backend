import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameGateway } from './gateway/game.gateway';
import {PrismaService} from "../../prisma/prisma.service";
import {GameModel} from "./models/game.model";

@Module({
  providers: [GameGateway, GameService, PrismaService, GameModel],
})
export class GameModule {}
