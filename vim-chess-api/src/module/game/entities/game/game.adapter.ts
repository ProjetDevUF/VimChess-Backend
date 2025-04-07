import { Injectable } from '@nestjs/common';
import {
  InitedGameDataDto as InitedGameData,
  PlainBoardState,
} from '../../dto';
import { DrawGame, FiguresCellState, GameWithWinner } from './game.types';
import { Game } from './game.entity';
import { GameAdapterI } from '../../game.adapter.interface';
import { Player } from '../player.entity';

@Injectable()
export class GameAdapter implements GameAdapterI {
  public plainBoardState(game: Game): PlainBoardState {
    const boards: FiguresCellState = game.process.state;

    const plainObj = {
      w: {},
      b: {},
    };

    const [white, black] = Object.values(boards);
    for (const [figure, cell] of white.entries()) {
      plainObj.w[cell] = figure;
    }
    for (const [figure, cell] of black.entries()) {
      plainObj.b[cell] = figure;
    }
    return plainObj;
  }

  public initedGameDataDto(userUid: string, game: Game): InitedGameData {
    const plainObj = this.plainBoardState(game);
    return {
      board: plainObj,
      gameId: game.id,
      side: game.players.find((pl) => pl.userUid === userUid).side,
      maxTime: game.config.time,
      timeIncrement: game.config.timeIncrement,
    };
  }

  public gameWithWinnerDto(game: Game): GameWithWinner {
    const base = {
      id: game.id,
      moves: game.moves,
      config: game.config,
    };

    const plainWinner = {
      userUid: game.winner.userUid,
      username: game.winner.username,
      side: game.winner.side,
    };
    const plainLooser = {
      userUid: game.looser.userUid,
      username: game.looser.username,
      side: game.looser.side,
    };

    return { ...base, winner: plainWinner, looser: plainLooser };
  }

  public gameWithDrawDto(game: Game): DrawGame {
    const [pl1, pl2] = game.players.map((pl: Player) => {
      return {
        userId: pl.userUid,
        name: pl.username,
        side: pl.side,
      };
    });

    return { id: game.id, moves: game.moves, config: game.config, pl1, pl2 };
  }
}
