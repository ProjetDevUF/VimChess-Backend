import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto, ChatMessage, ConnectToGame, TurnBody } from './dto';
import { Server, Socket } from 'socket.io';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsValidationFilter } from '../../common/filters/WsValidationFilter';
import { ClientStore } from './ClientStore';
import { ConnectionPatchProvider } from './connection.provider';
import { room, Game, Lobby } from '../../common/constants/game/Emit.Types';
import { IsPlayer } from '../../common/guards/isplayer.guard';

@WebSocketGateway({
  namespace: 'game',
  cors: { origin: '*' },
  transports: ['websocket'],
})
@UseFilters(new WsValidationFilter())
@UsePipes(new ValidationPipe())
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly clientStore: ClientStore,
    private readonly connService: ConnectionPatchProvider,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
    const client = await this.connService.processClient(socket);
    this.clientStore.setClient(socket.id, client);
    if (!client.authorized) {
      client.anonymousTokenEvent();
    }

    client.lobbyUpdateEvent(this.gameService.getLobby());
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
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
    @ConnectedSocket() socket: Socket,
    @MessageBody() config: CreateGameDto,
  ) {
    const client = this.clientStore.getClient(socket.id);
    const game = await this.gameService.createGame(client, config);
    client.gameCreatedEvent(game);
    await client.join(game.id);

    const lobby = this.gameService.getLobby();
    this.server.emit(Lobby.update, lobby);
  }

  @SubscribeMessage('test')
  test() {
    console.log('rentrer');
  }

  @SubscribeMessage('join') async join(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { gameId }: ConnectToGame,
  ) {
    const client = this.clientStore.getClient(socket.id);
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
  rejoin() {}

  @SubscribeMessage('leave')
  leave() {}

  @UseGuards(IsPlayer)
  @SubscribeMessage('move')
  async move(@ConnectedSocket() socket: Socket, @MessageBody() turn: TurnBody) {
    const client = this.clientStore.getClient(socket.id);
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
  chatMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { gameId, text }: ChatMessage,
  ): void {
    const client = this.clientStore.getClient(socket.id);
    const message = this.gameService.pushMessage(gameId, text, client);
    this.server.to(room(gameId)).emit(Game.message, message);
  }

  @SubscribeMessage('surrender')
  surrender() {}

  @SubscribeMessage('drawPropose')
  drawPropose() {}

  @SubscribeMessage('drawAccept')
  drawAccept() {}

  @SubscribeMessage('drawReject')
  drawReject() {}
}
