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
import { CreateGameDto, ChatMessage } from './dto';
import { Server, Socket } from 'socket.io';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsValidationFilter } from '../../common/filters/WsValidationFilter';
import { ClientStore } from './ClientStore';
import { ConnectionPatchProvider } from './connection.provider';
import { room, Game, Lobby } from '../../common/constants/game/Emit.Types';

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
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('create')
  async create(
    @ConnectedSocket() socket: Socket,
    @MessageBody() config: CreateGameDto,
  ) {
    const client = this.clientStore.getClient(socket.id);
    const game = await this.gameService.createGame(client, config);
    await client.join(game.id);
    client.gameCreatedEvent(game);

    const lobby = this.gameService.getLobby();
    this.server.emit(Lobby.update, lobby);
  }

  join() {}

  rejoin() {}

  leave() {}

  move() {}

  chatMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { gameId, text }: ChatMessage,
  ): void {
    const client = this.clientStore.getClient(socket.id);
    const message = this.gameService.pushMessage(gameId, text, client);
    this.server.to(room(gameId)).emit(Game.message, message);
  }

  surrender() {}

  drawPropose() {}

  drawAccept() {}

  drawReject() {}
}
