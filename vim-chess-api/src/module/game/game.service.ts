import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto';
import { GameModel } from './game.model';
import { Client } from './entities';
import { GameData, Message } from './entities/game';
import { Game } from './entities/game/game.entity';
import { ERROR } from '../../common/constants/error.constants';
import { GameAdapterI } from './game.adapter.interface';
import { GameList } from './game.list';

@Injectable()
export class GameService {
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

  public pushMessage(gameId: number, message: string, client: Client): Message {
    const game = this.findGameById(gameId);
    return game.chat.addMessage(message, client);
  }

  public findGameById(id: number): Game {
    const game = this.list.games.find((game) => game.id === id);
    if (!game) throw new NotFoundException(ERROR.ResourceNotFound);
    return game;
  }

  public getLobby(): GameData[] {
    return this.list.getLobby();
  }
}
