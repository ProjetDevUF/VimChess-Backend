import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GameService } from '../../module/game/game.service';

@Injectable()
export class IsPlayer implements CanActivate {
  constructor(private readonly service: GameService) {}

  canActivate(context: ExecutionContext): boolean {
    const wsContext = context.switchToWs();
    const socket = wsContext.getClient();
    const gameId: number = wsContext.getData().gameId;

    const game = this.service.findGameById(gameId);

    return !!game.players.find((pl) => pl.client.socket.id === socket.id);
  }
}
