import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameList } from '../game.list';
import { GameManagementService } from './GameMagement.service';
import { GameAdapterI } from '../game.adapter.interface';
import { Client } from '../entities';
import { TurnBody } from '../dto';
import { ERROR } from '../../../common/constants/error.constants';
import { Game } from '../entities/game/game.entity';
import { CompletedTurnEntity, TurnEntity } from '../entities/game';
import { Player } from '../entities/player.entity';

@Injectable()
export class GameActionService {
  constructor(
    private readonly gameManagementService: GameManagementService,
    private readonly list: GameList,
    @Inject('GameAdapterI') private readonly adapter: GameAdapterI,
  ) {}

  public pushMessage(gameId: number, message: string, client: Client) {
    const game: Game = this.gameManagementService.findGameById(gameId);
    return game.chat.addMessage(message, client);
  }

  public makeTurn(
    gameId: number,
    userUid: string,
    { figure, cell }: TurnBody,
  ): TurnEntity | CompletedTurnEntity {
    const game: Game = this.gameManagementService.findGameById(gameId);

    const completedMove: TurnEntity = game.makeTurn(userUid, figure, cell);
    if (completedMove.result.mate) {
      const [pl1, pl2] = game.players;
      const winner = pl1.userUid === userUid ? pl1 : pl2;
      const looser = pl1.userUid !== userUid ? pl1 : pl2;

      game.endGame(winner, looser);

      const gameDto = this.adapter.gameWithWinnerDto(game);
      this.list.gameEnd(gameDto.id);

      return { completedMove, gameDto, winner, looser };
    }
    return completedMove;
  }

  public proposeDraw(gameId: number, client: Client) {
    const game = this.gameManagementService.findGameById(gameId);

    const player = game.players.find((pl) => pl.userUid === client.userUid);
    if (!player) throw new NotFoundException(ERROR.ResourceNotFound);

    if (game.draw[player.side])
      throw new ConflictException(ERROR.ConflictError);
    game.setDrawProposeFrom(player.side);
    return game.draw;
  }

  public rejectDraw(gameId: number) {
    const game = this.gameManagementService.findGameById(gameId);
    const { w, b } = game.draw;

    if (!w && !b) throw new ConflictException(ERROR.ConflictError);

    game.rejectDraw();
    return { w: false, b: false };
  }

  public acceptDraw(gameId: number, client: Client) {
    const game: Game = this.gameManagementService.findGameById(gameId);

    const player: Player | undefined = game.players.find(
      (pl) => pl.userUid === client.userUid,
    );
    if (!player) throw new NotFoundException(ERROR.ResourceNotFound);

    const { w, b } = game.draw;
    if (!w && !b) throw new ConflictException(ERROR.ConflictError);

    game.setDrawProposeFrom(player.side);
    game.endGameByDraw();

    const gameDto = this.adapter.gameWithWinnerDto(game);
    this.list.gameEnd(gameDto.id);

    return gameDto;
  }

  public surrender(gameId: number, client: Client) {
    const game = this.gameManagementService.findGameById(gameId);
    if (!game) throw new NotFoundException(ERROR.ResourceNotFound);

    const [pl1, pl2] = game.players;
    const winner = pl1.userUid !== client.userUid ? pl1 : pl2;
    const looser = pl1.userUid === client.userUid ? pl1 : pl2;
    game.endGame(winner, looser);

    const gameDto = this.adapter.gameWithWinnerDto(game);
    this.list.gameEnd(gameDto.id);
    return { winner, looser, gameDto };
  }

  public removeInitedGamesBy(player: Client): void {
    this.list.removeInitedGames(player);
  }

  public findCurrentOpponent(player: Client): Player | undefined {
    const game = this.list.findPendingClientGame(player);
    if (!game) return;

    return game.players.find((pl) => pl.userUid !== player.userUid);
  }

  public async connectToGame(player: Client, gameId: number): Promise<Game> {
    const game = this.list.findInLobby(gameId);
    if (!game) throw new NotFoundException(ERROR.ResourceNotFound);

    const pl1 = game.players[0];
    if (player.userUid && pl1.userUid === player.userUid) {
      throw new ConflictException(ERROR.ConflictError);
    }
    game.addPlayer(player);
    await this.gameManagementService.joinGame(
      player.userUid,
      gameId,
      game.players[1].side,
    );
    this.list.pushToStartedGames(gameId);

    return game;
  }

  public findPendingGame(client: Client) {
    const game = this.list.findPendingClientGame(client);
    if (!game) throw new NotFoundException(ERROR.ResourceNotFound);
    return game;
  }

  public initedGameDataDto(userUid: string, game: Game) {
    return this.adapter.initedGameDataDto(userUid, game);
  }

  public gameWithWinnerDto(game: Game) {
    return this.adapter.gameWithWinnerDto(game);
  }
}
