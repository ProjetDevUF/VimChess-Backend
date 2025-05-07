import { Injectable, NotFoundException } from '@nestjs/common';
import { GameList } from '../game.list';
import { GameModel } from '../game.model';
import { Client } from '../entities';
import { CreateGameDto } from '../dto';
import { Game } from '../entities/game/game.entity';
import { ERROR } from '../../../common/constants/error.constants';
import { GameData } from '../entities/game';

@Injectable()
export class GameManagementService {
  constructor(
    private readonly list: GameList,
    private gameModel: GameModel,
  ) {}

  public async createGame(
    player: Client,
    config: CreateGameDto,
  ): Promise<Game> {
    const newGame = new Game(player, config);
    const gameDb = await this.gameModel.createGame(newGame);
    newGame.id = gameDb.id;
    this.list.addGameToLobby(newGame);
    return newGame;
  }

  public findGameById(gameId: number): Game {
    const game = this.list.games.find((g) => g.id === gameId);
    if (!game) throw new NotFoundException(ERROR.ResourceNotFound);
    return game;
  }

  public getLobby(): GameData[] {
    return this.list.getLobby();
  }

  public async connectPlayer(uid: string) {
    await this.gameModel.connection(uid, true);
  }

  public async disconnectPlayer(uid: string) {
    await this.gameModel.connection(uid, false);
  }
}
