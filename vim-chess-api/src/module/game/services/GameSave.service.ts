import { Injectable } from '@nestjs/common';
import { GameModel } from '../game.model';
import { Player } from '../entities/player.entity';
import { Config, GameResult, GameWithWinner, Move } from '../entities/game';

@Injectable()
export class GameSaveService {
  constructor(private readonly gameModel: GameModel) {}

  public async saveGame(
    gameId: number,
    pl1: Player,
    pl2: Player,
    result: GameResult,
    winner: boolean,
  ) {
    if (!pl1.authorized || !pl2.authorized || !result) return null;

    return winner
      ? await this.gameModel.saveGameWithWinner(gameId, {
          winner: pl1,
          looser: pl2,
          ...result,
        })
      : await this.gameModel.saveGameDraw({ pl1, pl2, ...result });
  }

  public async finalizeGameSave(
    winner: Player,
    looser: Player,
    resultDto: { id: number; config: Config; moves: Move[] },
  ) {
    return this.gameModel.saveGameWithWinner(resultDto.id, {
      winner,
      looser,
      ...resultDto,
    });
  }

  public async saveDraw(pl1: Player, pl2: Player, gameDto: GameWithWinner) {
    return this.gameModel.saveGameDraw({
      pl1,
      pl2,
      ...gameDto,
    });
  }
}
