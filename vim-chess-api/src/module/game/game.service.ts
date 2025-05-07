import { Injectable } from '@nestjs/common';
import { CreateGameDto, InitedGameDataDto, TurnBody } from './dto';
import { Client } from './entities';
import { GameManagementService } from './services/GameMagement.service';
import { GameActionService } from './services/GameAction.service';
import { GameSaveService } from './services/GameSave.service';
import { CompletedTurnEntity, TurnEntity } from './entities/game';
import { Player } from './entities/player.entity';
import { Game } from './entities/game/game.entity';

@Injectable()
export class GameService {
  constructor(
    private readonly gameManagementService: GameManagementService,
    private readonly gameActionService: GameActionService,
    private readonly gameSaveService: GameSaveService,
  ) {}

  public async createGame(player: Client, config: CreateGameDto) {
    return this.gameManagementService.createGame(player, config);
  }

  public getLobby() {
    return this.gameManagementService.getLobby();
  }

  public async makeTurn(
    gameId: number,
    userUid: string,
    turn: TurnBody,
  ): Promise<TurnEntity | CompletedTurnEntity> {
    const completedMove: TurnEntity | CompletedTurnEntity =
      this.gameActionService.makeTurn(gameId, userUid, turn);

    if (completedMove instanceof CompletedTurnEntity) {
      await this.gameSaveService.saveGame(
        gameId,
        completedMove.winner,
        completedMove.looser,
        completedMove.gameDto,
        true,
      );
    }
    return completedMove;
  }

  public async leaveGame(client: Client) {
    const game = this.gameActionService.findPendingGame(client);
    const [pl1, pl2] = game.players;

    const winner = pl1.userUid !== client.userUid ? pl1 : pl2;
    const looser = pl1.userUid === client.userUid ? pl1 : pl2;

    game.endGame(winner, looser);

    const gameDto = this.gameActionService.gameWithWinnerDto(game);

    await this.gameSaveService.finalizeGameSave(winner, looser, gameDto);
    return { winner, looser, gameDto };
  }

  public async surrender(gameId: number, client: Client) {
    const { winner, looser, gameDto } = this.gameActionService.surrender(
      gameId,
      client,
    );
    await this.gameSaveService.saveGame(gameId, winner, looser, gameDto, true);
    return { winner, looser, gameDto };
  }

  public proposeDraw(gameId: number, client: Client) {
    return this.gameActionService.proposeDraw(gameId, client);
  }

  public async acceptDraw(gameId: number, client: Client) {
    const gameDto = this.gameActionService.acceptDraw(gameId, client);

    const game: Game = this.gameManagementService.findGameById(gameId);
    const [pl1, pl2] = game.players;

    await this.gameSaveService.saveDraw(pl1, pl2, gameDto);
    return gameDto;
  }

  public removeInitedGamesBy(player: Client): void {
    return this.gameActionService.removeInitedGamesBy(player);
  }

  public findCurrentOpponent(player: Client): Player | undefined {
    return this.gameActionService.findCurrentOpponent(player);
  }

  public connectToGame(client: Client, gameId: number): Game {
    return this.gameActionService.connectToGame(client, gameId);
  }

  public getInitedGameData(userUid: string, game: Game): InitedGameDataDto {
    return this.gameActionService.initedGameDataDto(userUid, game);
  }

  public findPendingGame(client: Client): Game {
    return this.gameActionService.findPendingGame(client);
  }

  public pushMessage(gameId: number, message: string, client: Client) {
    return this.gameActionService.pushMessage(gameId, message, client);
  }

  public rejectDraw(gameId: number) {
    return this.gameActionService.rejectDraw(gameId);
  }

  public async connectPlayer(uid: string) {
    await this.gameManagementService.connectPlayer(uid);
  }

  public async disconnectPlayer(uid: string) {
    await this.gameManagementService.disconnectPlayer(uid);
  }

  public getUsersConnected() {
    return this.gameManagementService.getUsersConnected();
  }
}
