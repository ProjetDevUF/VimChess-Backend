import { Player } from '../player.entity';
import { Config, Move } from './game.types';
import { GameProcess, GameChat } from './logic';
import { Client } from '../client.entity';

export class Game {
  id: number;
  isActive = false;
  players: Player[];
  config: Config;
  process: GameProcess = new GameProcess();
  chat: GameChat;
  moves: Move[] = [];
  winner: null | Player = null;
  looser: null | Player = null;
  endGameByTimeoutCb: (game: Game, winer: Player, looser: Player) => void;

  constructor(creator: Client, config: Config, gameEndCallback) {
    this.endGameByTimeoutCb = gameEndCallback;

    const side: 'w' | 'b' =
      config.side === 'rand' ? (Math.random() > 0.5 ? 'w' : 'b') : config.side;

    const player = new Player(creator, side, config.time);
    this.players = [player];
    this.config = config;
  }
}
