import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { GameService } from '../services/game.service';
import { CreateGameDto, UpdateGameDto } from '../dto';
import { Server } from 'socket.io';
import { room } from 'src/common/constants/game/Emit.Types';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsValidationFilter } from '../../../common/filters/WsValidationFilter';
import { Client } from '../entities';

@WebSocketGateway({ namespace: 'game', cors: true, transports: ['websocket'] })
@UseFilters(new WsValidationFilter())
@UsePipes(new ValidationPipe())
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Client) {
    console.log(`Client connected: ${client.userUid}`);
  }

  handleDisconnect(client: Client) {
    console.log(`Client disconnected: ${client.userUid}`);
  }

  @SubscribeMessage('createGame')
  create(@MessageBody() createGameDto: CreateGameDto) {
    this.gameService.create(createGameDto);
  }

  @SubscribeMessage('findAllGame')
  findAll() {
    this.gameService.findAll();
  }

  @SubscribeMessage('findOneGame')
  findOne(@MessageBody() id: number) {
    this.gameService.findOne(id);
  }

  @SubscribeMessage('updateGame')
  update(@MessageBody() updateGameDto: UpdateGameDto) {
    this.gameService.update(updateGameDto.id, updateGameDto);
  }
}
