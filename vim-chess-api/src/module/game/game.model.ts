import { PrismaService } from '../../prisma/prisma.service';
import { Game } from './entities/game/game.entity';

export class GameModel {
  constructor(private prismaService: PrismaService) {}

  createGame(gameDto: Game) {
    const uid_white: string | null =
      gameDto.players[0].side === 'w' ? gameDto.players[0].userUid : null;
    const uid_black: string | null =
      gameDto.players[0].side === 'b' ? null : gameDto.players[0].userUid;
    return this.prismaService.game.create({
      data: {
        uid_white,
        uid_black,
        max_time: 600,
        move: '{}',
      },
    });
  }
}
