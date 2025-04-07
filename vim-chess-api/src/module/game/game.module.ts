import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import {PrismaService} from "../../prisma/prisma.service";
import {GameModel} from "./game.model";

@Module({
  providers: [GameGateway, GameService, PrismaService, GameModel],
})
export class GameModule {}
