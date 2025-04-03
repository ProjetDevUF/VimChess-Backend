import { Player } from '../player.entity';
import { Config, Move } from './game.types';
import { GameProcess, GameChat } from './logic';

export class Game {
  id: number;
  isActive = false;
  players: Player[];
  config: Config;
  process: GameProcess = new GameProcess();
  chat: GameChat = new GameChat();
  moves: Move[] = [];
  winner: null | Player = null;
  looser: null | Player = null;
  draw: {
    w: boolean;
    b: boolean;
  } = { w: false, b: false };
  endGameByTimeoutCb: (game: Game, winer: Player, looser: Player) => void;
}
