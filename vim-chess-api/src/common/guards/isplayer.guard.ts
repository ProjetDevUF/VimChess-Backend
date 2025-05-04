import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GameManagementService } from '../../module/game/services/GameMagement.service';

@Injectable()
export class IsPlayer implements CanActivate {
  constructor(private readonly service: GameManagementService) {}

  canActivate(context: ExecutionContext): boolean {
    const wsContext = context.switchToWs();
    const socket = wsContext.getClient();
    const gameId: number = wsContext.getData().gameId;

    const game = this.service.findGameById(gameId);

    return !!game.players.find((pl) => pl.client.socket.id === socket.id);
  }
}
