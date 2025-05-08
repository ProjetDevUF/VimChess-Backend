import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import {
  ChatMessage,
  ConnectToGame,
  CreateGameDto,
  JoinQueueDto,
  RematchAcceptDto,
  RematchProposeDto,
  RematchRejectDto,
  TurnBody,
} from './dto';
import { Server, Socket } from 'socket.io';
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsValidationFilter } from '../../common/filters/WsValidationFilter';
import { ClientStore } from './ClientStore';
import { ConnectionPatchProvider } from './connection.provider';
import {
  Game,
  GameEnd,
  Lobby,
  Matchmaking,
  room,
  User,
} from '../../common/constants/game/Emit.Types';
import { IsPlayer } from '../../common/guards/isplayer.guard';
import { LoggerService } from '../../common/filters/logger';
import { GetClient } from '../../common/decorators/get-client.decorator';
import { Client } from './entities';
import { CustomSocket } from '../../common/constants/CustomSocket.interface';
import { CompletedTurnEntity, TurnEntity } from './entities/game';

@WebSocketGateway({
  namespace: 'game',
  cors: { origin: '*' },
  transports: ['websocket'],
})
@UseFilters(new WsValidationFilter())
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly loggerService: LoggerService = new LoggerService();

  constructor(
    private readonly gameService: GameService,
    private readonly clientStore: ClientStore,
    private readonly connService: ConnectionPatchProvider,
  ) {
    this.loggerService.setContext(GameGateway.name);
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: CustomSocket) {
    this.loggerService.log(`Client connected: ${socket.id}`);
    const client = await this.connService.processClient(socket);
    if (client.username !== 'Anonymous') {
      this.loggerService.log(`Client connected is ${client.username}`);
    }
    this.clientStore.setClient(socket.id, client);
    if (!client.authorized) {
      client.anonymousTokenEvent();
    } else {
      await this.gameService.connectPlayer(client.userUid);
      const users = await this.gameService.getUsersConnected();
      this.server.emit(User.connected, users);
    }

    socket.customClient = client;
    client.lobbyUpdateEvent(this.gameService.getLobby());
  }

  async handleDisconnect(socket: Socket) {
    this.loggerService.log(`Client disconnected: ${socket.id}`);
    const client = this.clientStore.getClient(socket.id);
    this.gameService.removeInitedGamesBy(client);

    // Remove from matchmaking queue if present
    this.gameService.removeFromQueue(client);

    const opponent = this.gameService.findCurrentOpponent(client);
    if (opponent) {
      opponent.opponentDisconnectedEvent();
    } else {
      await this.gameService.disconnectPlayer(client.userUid);
      const users = await this.gameService.getUsersConnected();
      this.server.emit(User.connected, users);
    }

    const lobby = this.gameService.getLobby();
    this.server.emit(Lobby.update, lobby);
  }

  @SubscribeMessage('create')
  async create(
    @GetClient() client: Client,
    @MessageBody() config: CreateGameDto,
  ) {
    await this.createGame(client, config);
  }

  async createGame(client: Client, config?: any) {
    if (!config || Object.keys(config).length === 0 || !config.side) {
      config = { side: 'rand' };
    }

    this.loggerService.log(`Creation new game by ${client.username} ...`);
    const game = await this.gameService.createGame(client, config);
    client.gameCreatedEvent(game);
    await client.join(game.id);

    const lobby = this.gameService.getLobby();
    this.loggerService.log(`New game ${game.id}`);
    this.server.emit(Lobby.update, lobby);
    return game.id;
  }

  @SubscribeMessage('join') async join(
    @GetClient() client: Client,
    @MessageBody() connectToGame: ConnectToGame,
  ) {
    const { gameId } = connectToGame;
    await this.joinGame(client, gameId);
  }

  async joinGame(client: Client, gameId: number) {
    const game = await this.gameService.connectToGame(client, gameId);
    await client.join(game.id);
    for (const player of game.players) {
      player.initedGameDataEvent(
        this.gameService.getInitedGameData(player.userUid, game),
      );
    }
    this.loggerService.log(`${client.username} joined game ${gameId}`);
    this.server.to(room(game.id)).emit(Game.start);
    game.start();
    const lobby = this.gameService.getLobby();
    this.server.emit(Lobby.update, lobby);
  }

  @SubscribeMessage('rejoin')
  async rejoin(@GetClient() client: Client) {
    const game = this.gameService.findPendingGame(client);
    await client.join(game.id);
    const player = game.players.find((pl) => pl.userUid === client.userUid);
    if (player) {
      player.initedGameDataEvent(
        this.gameService.getInitedGameData(client.userUid, game),
      );

      this.loggerService.log(`${client.username} rejoined game ${game.id}`);

      this.server.to(room(game.id)).emit(Game.playerReconected, {
        opponent: {
          uid: client.userUid,
          username: client.username,
        },
      });
    }
  }

  @SubscribeMessage('leave')
  async leave(@GetClient() client: Client) {
    const { winner, looser, gameDto } =
      await this.gameService.leaveGame(client);
    this.loggerService.log(
      `Client ${client.username} leave game ${gameDto.id}`,
    );

    winner.gameEndEvent(true, gameDto, GameEnd.playerLeave);
    looser.gameEndEvent(false, gameDto, GameEnd.playerLeave);
  }

  @UseGuards(IsPlayer)
  @SubscribeMessage('move')
  async move(@GetClient() client: Client, @MessageBody() turn: TurnBody) {
    const completedMove: TurnEntity | CompletedTurnEntity =
      await this.gameService.makeTurn(turn.gameId, client.userUid, turn);
    if (completedMove instanceof CompletedTurnEntity) {
      this.loggerService.log(
        `${completedMove.winner.username} win the game ${turn.gameId}`,
      );
      this.loggerService.log(
        `${completedMove.looser.username} loose the game ${turn.gameId}`,
      );
      // Emit only essential board update data
      this.server.to(room(turn.gameId)).emit(Game.boardUpdate, {
        effect: completedMove.completedMove.result,
        update: {
          figure: turn.figure,
          cell: turn.cell,
          prevCell: completedMove.completedMove.prevCell,
          side: completedMove.completedMove.side,
        },
      });

      completedMove.winner.gameEndEvent(
        true,
        completedMove.gameDto,
        GameEnd.mate,
      );
      completedMove.looser.gameEndEvent(
        false,
        completedMove.gameDto,
        GameEnd.mate,
      );
    } else {
      this.server.to(room(turn.gameId)).emit(Game.boardUpdate, {
        effect: completedMove.result,
        update: {
          figure: turn.figure,
          cell: turn.cell,
          prevCell: completedMove.prevCell,
          side: completedMove.side,
        },
      });
    }
  }

  @SubscribeMessage('chatMessage')
  @UseGuards(IsPlayer)
  chatMessage(
    @GetClient() client: Client,
    @MessageBody() { gameId, text }: ChatMessage,
  ): void {
    const message = this.gameService.pushMessage(gameId, text, client);
    this.server.to(room(gameId)).emit(Game.message, message);
  }

  @SubscribeMessage('surrender')
  @UseGuards(IsPlayer)
  async surrender(
    @GetClient() client: Client,
    @MessageBody() { gameId }: { gameId: number },
  ) {
    const { winner, looser, gameDto } = await this.gameService.surrender(
      gameId,
      client,
    );
    this.loggerService.log(`${client.username} surrender game ${gameId}`);

    winner.gameEndEvent(true, gameDto, GameEnd.surrender);
    looser.gameEndEvent(false, gameDto, GameEnd.surrender);
  }

  @SubscribeMessage('drawPropose')
  @UseGuards(IsPlayer)
  drawPropose(
    @GetClient() client: Client,
    @MessageBody() { gameId }: { gameId: number },
  ) {
    const propose = this.gameService.proposeDraw(gameId, client);
    this.loggerService.log(
      `${client.username} proposed a draw on game ${gameId}`,
    );
    this.server.to(room(gameId)).emit(Game.drawPropose, propose);
  }

  @SubscribeMessage('drawAccept')
  @UseGuards(IsPlayer)
  async drawAccept(
    @GetClient() client: Client,
    @MessageBody() { gameId }: { gameId: number },
  ) {
    const game = await this.gameService.acceptDraw(gameId, client);
    this.loggerService.log(
      `${client.username} accepted draw on game ${gameId}`,
    );

    this.server.to(room(gameId)).emit(Game.end, { reason: GameEnd.draw, game });
  }

  @SubscribeMessage('drawReject')
  @UseGuards(IsPlayer)
  drawReject(@MessageBody() { gameId }: { gameId: number }) {
    const result = this.gameService.rejectDraw(gameId);
    this.loggerService.log(`rejection of draw on game ${gameId}`);
    this.server.to(room(gameId)).emit(Game.rejectDraw, result);
  }

  /**
   * Join the matchmaking queue
   */
  @SubscribeMessage(Matchmaking.joinQueue)
  async joinMatchmakingQueue(
    @GetClient() client: Client,
    @MessageBody() joinQueueDto: JoinQueueDto,
  ) {
    this.loggerService.log(
      `Player ${client.username} joining matchmaking queue`,
    );
    const players = await this.gameService.addToQueue(
      client,
      joinQueueDto.preferredSide,
    );
    if (players?.player1 && players?.player2) {
      const gameId = await this.createGame(players.player1.client, {
        side: joinQueueDto.preferredSide,
      });
      await this.joinGame(players.player2.client, gameId);
    }
    // Send initial queue status
    const queueStatus = this.gameService.getQueueStatus(client);
    client.socket.emit(Matchmaking.queueStatus, queueStatus);

    // Schedule periodic queue status updates
    const intervalId = setInterval(async () => {
      const res = await this.gameService.userIsInGameActive(client.userUid);
      if (!res) {
        const updatedStatus = this.gameService.getQueueStatus(client);
        client.socket.emit(Matchmaking.queueStatus, updatedStatus);
      } else {
        clearInterval(intervalId);
        // Store the interval ID to clear it when the player leaves the queue
        client.socket.data.queueStatusInterval = intervalId;
        return;
      }
    }, 5000); // Update every  5 seconds
  }

  /**
   * Leave the matchmaking queue
   */
  @SubscribeMessage(Matchmaking.leaveQueue)
  leaveMatchmakingQueue(@GetClient() client: Client) {
    this.loggerService.log(
      `Player ${client.username} leaving matchmaking queue`,
    );
    this.gameService.removeFromQueue(client);

    // Clear the interval for queue status updates
    if (client.socket.data.queueStatusInterval) {
      clearInterval(client.socket.data.queueStatusInterval);
      delete client.socket.data.queueStatusInterval;
    }
  }

  /**
   * Propose a rematch after a game has ended
   */
  @SubscribeMessage(Matchmaking.rematchPropose)
  proposeRematch(
    @GetClient() client: Client,
    @MessageBody() rematchProposeDto: RematchProposeDto,
  ) {
    const { gameId } = rematchProposeDto;
    this.loggerService.log(
      `Player ${client.username} proposing rematch for game ${gameId}`,
    );

    const proposed = this.gameService.proposeRematch(gameId, client);
    if (proposed) {
      // Notify the opponent about the rematch proposal
      const game = this.gameService.findGameById(gameId);
      const opponent = game.players.find((p) => p.userUid !== client.userUid);

      if (opponent) {
        opponent.client.socket.emit(Matchmaking.rematchPropose, { gameId });
      }
    }
  }

  /**
   * Accept a rematch proposal
   */
  @SubscribeMessage(Matchmaking.rematchAccept)
  async acceptRematch(
    @GetClient() client: Client,
    @MessageBody() rematchAcceptDto: RematchAcceptDto,
  ) {
    const { gameId } = rematchAcceptDto;
    this.loggerService.log(
      `Player ${client.username} accepting rematch for game ${gameId}`,
    );

    const newGameId = await this.gameService.acceptRematch(gameId, client);
    if (newGameId) {
      // Notify both players about the new game
      const game = this.gameService.findGameById(newGameId);

      for (const player of game.players) {
        player.client.socket.emit(Matchmaking.rematchAccept, {
          oldGameId: gameId,
          newGameId,
        });
      }
    }
  }

  /**
   * Reject a rematch proposal
   */
  @SubscribeMessage(Matchmaking.rematchReject)
  rejectRematch(
    @GetClient() client: Client,
    @MessageBody() rematchRejectDto: RematchRejectDto,
  ) {
    const { gameId } = rematchRejectDto;
    this.loggerService.log(
      `Player ${client.username} rejecting rematch for game ${gameId}`,
    );

    this.gameService.rejectRematch(gameId, client);

    // Notify the opponent about the rejection
    const game = this.gameService.findGameById(gameId);
    const opponent = game.players.find((p) => p.userUid !== client.userUid);

    if (opponent) {
      opponent.client.socket.emit(Matchmaking.rematchReject, { gameId });
    }
  }
}
