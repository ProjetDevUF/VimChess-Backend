import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { ChatMessage, ConnectToGame, CreateGameDto, TurnBody } from './dto';
import { Server, Socket } from 'socket.io';
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsValidationFilter } from '../../common/filters/WsValidationFilter';
import { ClientStore } from './ClientStore';
import { ConnectionPatchProvider } from './connection.provider';
import {
  Game,
  GameEnd,
  Lobby,
  room,
} from '../../common/constants/game/Emit.Types';
import { IsPlayer } from '../../common/guards/isplayer.guard';
import { LoggerService } from '../../common/filters/logger';
import { ParseWSMessagePipe } from '../../common/filters/parse.pipe';
import { GetClient } from '../../common/decorators/get-client.decorator';
import { Client } from './entities';
import { CustomSocket } from '../../common/constants/CustomSocket.interface';

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
    }

    socket.customClient = client;
    client.lobbyUpdateEvent(this.gameService.getLobby());
  }

  handleDisconnect(socket: Socket) {
    this.loggerService.log(`Client disconnected: ${socket.id}`);
    const client = this.clientStore.getClient(socket.id);
    this.gameService.removeInitedGamesBy(client);
    const opponent = this.gameService.findCurrentOpponent(client);
    if (opponent) {
      opponent.opponentDisconnectedEvent();
    }

    const lobby = this.gameService.getLobby();
    this.server.emit(Lobby.update, lobby);
  }

  @SubscribeMessage('create')
  async create(
    @GetClient() client: Client,
    @MessageBody(ParseWSMessagePipe) config: CreateGameDto,
  ) {
    if (!config || Object.keys(config).length === 0) {
      config = { side: 'rand' };
    }

    this.loggerService.log(`Creation new game...`);
    const game = await this.gameService.createGame(client, config);
    client.gameCreatedEvent(game);
    await client.join(game.id);

    const lobby = this.gameService.getLobby();
    this.loggerService.log(`New game ${game.id}`);
    this.server.emit(Lobby.update, lobby);
  }

  @SubscribeMessage('join') async join(
    @GetClient() client: Client,
    @MessageBody(ParseWSMessagePipe) connectToGame: ConnectToGame,
  ) {
    const { gameId } = connectToGame;
    const game = this.gameService.connectToGame(client, gameId);
    await client.join(game.id);
    for (const player of game.players) {
      player.initedGameDataEvent(
        this.gameService.getInitedGameData(player.userUid, game),
      );
    }
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
    winner.gameEndEvent(true, gameDto, GameEnd.playerLeave);
    looser.gameEndEvent(false, gameDto, GameEnd.playerLeave);
  }

  @UseGuards(IsPlayer)
  @SubscribeMessage('move')
  async move(
    @GetClient() client: Client,
    @MessageBody(ParseWSMessagePipe) turn: TurnBody,
  ) {
    const { result, prevCell, side } = await this.gameService.makeTurn(
      turn.gameId,
      client.userUid,
      turn,
    );
    this.server.to(room(turn.gameId)).emit(Game.boardUpdate, {
      effect: result,
      update: { figure: turn.figure, cell: turn.cell, prevCell, side },
    });
  }

  @SubscribeMessage('chatMessage')
  @UseGuards(IsPlayer)
  chatMessage(
    @GetClient() client: Client,
    @MessageBody(ParseWSMessagePipe) { gameId, text }: ChatMessage,
  ): void {
    const message = this.gameService.pushMessage(gameId, text, client);
    this.server.to(room(gameId)).emit(Game.message, message);
  }

  @SubscribeMessage('surrender')
  @UseGuards(IsPlayer)
  async surrender(
    @GetClient() client: Client,
    @MessageBody(ParseWSMessagePipe) { gameId }: { gameId: number },
  ) {
    const { winner, looser, gameDto } = await this.gameService.surrender(
      gameId,
      client,
    );
    winner.gameEndEvent(true, gameDto, GameEnd.surrender);
    looser.gameEndEvent(false, gameDto, GameEnd.surrender);
  }

  @SubscribeMessage('drawPropose')
  @UseGuards(IsPlayer)
  drawPropose(
    @GetClient() client: Client,
    @MessageBody(ParseWSMessagePipe) { gameId }: { gameId: number },
  ) {
    const propose = this.gameService.proposeDraw(gameId, client);
    this.server.to(room(gameId)).emit(Game.drawPropose, propose);
  }

  @SubscribeMessage('drawAccept')
  @UseGuards(IsPlayer)
  async drawAccept(
    @GetClient() client: Client,
    @MessageBody(ParseWSMessagePipe) { gameId }: { gameId: number },
  ) {
    const game = await this.gameService.acceptDraw(gameId, client);
    this.server.to(room(gameId)).emit(Game.end, { reason: GameEnd.draw, game });
  }

  @SubscribeMessage('drawReject')
  @UseGuards(IsPlayer)
  drawReject(@MessageBody(ParseWSMessagePipe) { gameId }: { gameId: number }) {
    const result = this.gameService.rejectDraw(gameId);
    this.server.to(room(gameId)).emit(Game.rejectDraw, result);
  }
}
