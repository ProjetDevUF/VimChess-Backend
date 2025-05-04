import { TurnEntity } from './turn.entity';
import { GameWithWinner } from './game.types';
import { Player } from '../player.entity';

export class CompletedTurnEntity {
  completedMove: TurnEntity;
  gameDto: GameWithWinner;
  winner: Player;
  looser: Player;
}
