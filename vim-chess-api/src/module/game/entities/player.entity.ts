import { Client } from './client.entity';
import {
  GameEnd,
  Game as GameEvent,
} from 'src/common/constants/game/Emit.Types';
import { InitedGameDataDto } from '../dto';
import { GameWithWinner } from './game';

export class Player {
  side: 'w' | 'b';
  time: number;
  turningPlayer?: boolean;
  client: Client;

  constructor(client: Client, side: 'w' | 'b') {
    this.client = client;
    this.side = side;
    this.time = 600; // 10min en sec
    this.turningPlayer = false;
  }

  public opponentDisconnectedEvent(): void {
    this.client.socket.emit(GameEvent.playerDiconnected);
  }

  public gameEndEvent(
    winner: boolean,
    game: GameWithWinner,
    reason: GameEnd,
  ): void {
    this.client.socket.emit(GameEvent.end, { winner, game, reason });
  }

  public initedGameDataEvent(data: InitedGameDataDto): void {
    this.client.socket.emit(GameEvent.init, data);
  }

  get username(): string {
    return this.client.username;
  }

  get userUid(): string {
    return this.client.userUid;
  }

  get authorized(): boolean {
    return this.client.authorized;
  }
}
