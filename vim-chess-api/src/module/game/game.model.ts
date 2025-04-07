import { PrismaService } from '../../prisma/prisma.service';
import { Game } from './entities/game/game.entity';

export class GameModel {
  constructor(private prismaService: PrismaService) {}

  createGame(gameDto: Game) {
    const uid_white =
      gameDto.players[0].side === 'w'
        ? gameDto.players[0].userUid
        : gameDto.players[1].userUid;
    const uid_black =
      uid_white === gameDto.players[0].userUid
        ? gameDto.players[1].userUid
        : gameDto.players[0].userUid;
    return this.prismaService.game.create({
      data: {
        uid_white,
        uid_black,
        max_time: 600,
        move: '{}',
      },
    });
  }

  findAllGame() {
    return `This action returns all game`;
  }

  findOneGame(id: number) {
    return `This action returns a #${id} game`;
  }
}
