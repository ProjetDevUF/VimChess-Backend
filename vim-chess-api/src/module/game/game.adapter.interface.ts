import { InitedGameDataDto, PlainBoardState } from './dto';
import { DrawGame, GameWithWinner } from './entities/game';
import { Game } from './entities/game/game.entity';

export interface GameAdapterI {
  initedGameDataDto: (userUid: string, game: Game) => InitedGameDataDto;
  gameWithWinnerDto: (game: Game) => GameWithWinner;
  gameWithDrawDto: (game: Game) => DrawGame;
  plainBoardState: (game: Game) => PlainBoardState;
}
