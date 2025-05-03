import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameDto, InitedGameDataDto, TurnBody } from './dto';
import { GameModel } from './game.model';
import { Client } from './entities';
import { GameData, GameResult, Message } from './entities/game';
import { Game } from './entities/game/game.entity';
import { ERROR } from '../../common/constants/error.constants';
import { GameList } from './game.list';
import { Player } from './entities/player.entity';
import { GameAdapterI } from './game.adapter.interface';

@Injectable()
export class GameService {
  constructor(
    private readonly list: GameList,
    private gameModel: GameModel,
    @Inject('GameAdapterI') private readonly adapter: GameAdapterI,
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

  public connectToGame(player: Client, gameId: number): Game {
    const game = this.list.findInLobby(gameId);
    if (!game) throw new NotFoundException('Game not found');
    const pl1 = game.players[0];
    if (player.userUid && pl1.userUid === player.userUid) {
      throw new ConflictException('You are already in game');
    }

    game.addPlayer(player);
    this.list.pushToStartedGames(gameId);
    return game;
  }

  public removeInitedGamesBy(player: Client): void {
    this.list.removeInitedGames(player);
  }

  public findCurrentOpponent(player: Client): Player | null {
    const game = this.list.findPendingClientGame(player);
    if (!game) return null;

    return <Player>game.players.find((pl) => pl.userUid !== player.userUid);
  }

  public getInitedGameData(userUid: string, game: Game): InitedGameDataDto {
    return this.adapter.initedGameDataDto(userUid, game);
  }

  public async saveGame(
    gameId: number,
    pl1: Player,
    pl2: Player,
    result: GameResult,
    winner = false,
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

  public async makeTurn(
    gameId: number,
    userUid: string,
    { figure, cell }: TurnBody,
  ) {
    const game = this.findGameById(gameId);
    if (!game) throw new NotFoundException('Game not found');
    const completedMove = game.makeTurn(userUid, figure, cell);
    if (completedMove.result.mate) {
      const [pl1, pl2] = game.players;
      const winner = pl1.userUid === userUid ? pl1 : pl2;
      const looser = pl1.userUid !== userUid ? pl1 : pl2;
      game.endGame(winner, looser);
      const gameDto = this.adapter.gameWithWinnerDto(game);
      this.list.gameEnd(gameDto.id);
      await this.saveGame(gameId, winner, looser, gameDto, true);
    }
    return completedMove;
  }
}
