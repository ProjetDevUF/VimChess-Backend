import {WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer} from '@nestjs/websockets';
import {GameService} from '../services/game.service';
import {CreateGameDto} from '../dto/create-game.dto';
import {UpdateGameDto} from '../dto/update-game.dto';
import {Server} from 'socket.io';

@WebSocketGateway({namespace: 'game', cors: true, transports: ['websocket']})
export class GameGateway {
    constructor(private readonly gameService: GameService) {
    }

    @WebSocketServer()
    server: Server;

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

    @SubscribeMessage('removeGame')
    remove(@MessageBody() id: number) {
        this.gameService.remove(id);
    }
}
