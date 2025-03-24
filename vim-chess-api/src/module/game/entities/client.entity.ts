import { Socket } from 'socket.io';
import {
  Lobby,
  room,
  User,
  Game as GameEvent,
} from 'src/common/constants/game/Emit.Types';
import { Game } from './game/game.entity';
import { GameData } from './game';

export class Client {
  authorized: boolean;
  username: string;
  userUid: string;
  socket: Socket;
  anonymousTempToken?: string;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public lobbyUpdateEvent(lobby: GameData[]): void {
    this.socket.emit(Lobby.update, lobby);
  }

  public anonymousTokenEvent(): void {
    this.socket.emit(User.anonymousToken, {
      tempToken: this.anonymousTempToken,
      userUid: this.userUid,
    });
  }

  public pendingGameEvent(gameId: number): void {
    this.socket.emit(GameEvent.pendingGame, { gameId });
  }

  public gameCreatedEvent(game: Game): void {
    this.socket.emit(GameEvent.created, { gameId: game.id });
  }

  public async join(gameId: number): Promise<void> {
    await this.socket.join(room(gameId));
  }
}
