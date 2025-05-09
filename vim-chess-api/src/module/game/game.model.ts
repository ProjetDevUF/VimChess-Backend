import { PrismaService } from '../../prisma/prisma.service';
import { Game } from './entities/game/game.entity';
import { DrawGame, GameWithWinner } from './entities/game';
import { Prisma } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GameModel {
  constructor(private prismaService: PrismaService) {}

  findGameById(gameId: number) {
    return this.prismaService.game.findUnique({
      where: { id: gameId },
    });
  }

  async userIsInGame(userUid: string): Promise<boolean> {
    const game = await this.prismaService.game.findFirst({
      where: {
        OR: [
          { uid_white: userUid, NOT: { uid_white: null } },
          { uid_black: userUid, NOT: { uid_black: null } },
        ],
        is_finish: false,
      },
    });
    return !!game;
  }

  createGame(gameDto: Game) {
    const isWhite = gameDto.players[0].side === 'w';
    const uid_white: string | null = isWhite
      ? gameDto.players[0].userUid
      : null;
    const uid_black: string | null = isWhite
      ? null
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

  joinGame(userUid: string, gameId: number, side: 'w' | 'b') {
    return this.prismaService.game.update({
      where: {
        id: gameId,
      },
      data: {
        ...(side === 'w' ? { uid_white: userUid } : { uid_black: userUid }),
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
      const game = await this.prismaService.game.update({
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
      await this.updateEloRatings(winner.userUid, looser.userUid);

      return game;
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
    const userExists = await this.prismaService.user.findUnique({
      where: { uid },
    });

    if (!userExists) {
      return;
    }

    await this.prismaService.user.update({
      where: {
        uid,
      },
      data: {
        connect,
      },
    });
  }

  getConnectedUsers() {
    return this.prismaService.user.findMany({
      where: {
        connect: true,
      },
      select: {
        uid: true,
        username: true,
        elo: true,
        country: true,
        connect: true,
        Role: {
          select: {
            role: true,
          },
        },
      },
    });
  }

  async updateEloRatings(winnerId: string, loserId: string): Promise<void> {
    // Récupérer les joueurs depuis la base de données
    const winner = await this.prismaService.user.findUnique({
      where: { uid: winnerId },
      select: { elo: true },
    });

    const loser = await this.prismaService.user.findUnique({
      where: { uid: loserId },
      select: { elo: true },
    });

    if (!winner || !loser) {
      throw new Error('Joueur introuvable');
    }

    // Calculer le facteur K (vous pouvez ajuster selon vos besoins)
    const K = 24;

    // Calculer la probabilité de victoire
    const expectedWinProbability =
      1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));

    // Calculer les nouveaux classements Elo
    const winnerNewElo = Math.round(
      winner.elo + K * (1 - expectedWinProbability),
    );
    const loserNewElo = Math.round(
      loser.elo + K * (0 - (1 - expectedWinProbability)),
    );

    // Mettre à jour les classements dans la base de données
    await this.prismaService.user.update({
      where: { uid: winnerId },
      data: { elo: winnerNewElo },
    });

    await this.prismaService.user.update({
      where: { uid: loserId },
      data: { elo: Math.max(loserNewElo, 0) },
    });
  }
}
