import { PrismaService } from '../../prisma/prisma.service';
import { Game } from './entities/game/game.entity';
import { DrawGame, GameWithWinner } from './entities/game';
import { Prisma } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
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

  public async saveGameWithWinner(
    gameId: number,
    { winner, looser, moves }: GameWithWinner,
  ) {
    const jsonMoves = moves as Prisma.JsonArray;
    console.log(`Save game with winner. 
      Winner id = ${winner.userUid}, 
      Looser id = ${looser.userUid}.`);
    try {
      return await this.prismaService.game.update({
        where: {
          id: gameId,
        },
        data: {
          is_draw: false,
          move: jsonMoves,
          uid_winner: winner.userUid,
          uid_looser: looser.userUid,
          is_finish: true,
        },
      });
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Something went wrong!');
    }
  }

  public async saveGameDraw({ pl1, pl2, moves }: DrawGame) {
    const jsonMoves = moves as Prisma.JsonArray;
    return this.prismaService.game.create({
      data: {
        is_draw: true,
        move: jsonMoves,
        uid_white: pl1.side === 'w' ? pl1.userUid : pl2.userUid,
        uid_black: pl1.side === 'b' ? pl1.userUid : pl2.userUid,
        is_finish: true,
      },
    });
  }

  public async connection(uid: string, connect: boolean) {
    await this.prismaService.user.update({
      where: {
        uid,
      },
      data: {
        connect,
      },
    });
  }
}
