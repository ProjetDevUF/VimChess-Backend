import { Player } from '../player.entity';
import { Cell, Config, Figure, Move } from './game.types';
import { GameProcess, GameChat } from './logic';
import { Client } from '../client.entity';
import { CompletedMove } from './end.types';
import { ConflictException } from '@nestjs/common';

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
  draw: {
    w: boolean;
    b: boolean;
  } = { w: false, b: false };

  constructor(creator: Client, config: Config) {
    const side: 'w' | 'b' =
      config.side === 'rand' ? (Math.random() > 0.5 ? 'w' : 'b') : config.side;
    const player = new Player(creator, side);
    this.players = [player];
    this.config = config;
  }

  public addPlayer(client: Client): Player {
    const pickedSide = Object.values(this.players)[0].side;
    const side = pickedSide === 'w' ? 'b' : 'w';
    const player: Player = new Player(client, side);
    this.players.push(player);
    return player;
  }

  public endGame(winner: Player, looser: Player): void {
    this.isActive = false;
    this.winner = winner;
    this.looser = looser;
  }

  public endGameByDraw(): void {
    this.isActive = false;
  }

  public setDrawProposeFrom(side: 'w' | 'b'): void {
    this.draw[side] = true;
  }

  public rejectDraw(): void {
    this.draw = { w: false, b: false };
  }

  private saveMove(
    figure: Figure,
    to: Cell,
    from: Cell,
    completedMove: CompletedMove,
  ): void {
    this.moves.push({
      side: this.process.turnSide,
      figure,
      from,
      to,
      ...completedMove,
    });
  }

  public makeTurn(
    playerUid: string,
    figure: Figure,
    cell: Cell,
  ): { result: CompletedMove; prevCell: Cell; side: 'w' | 'b' } {
    if (!this.isActive) throw new ConflictException('Game is not active');

    const player = this.players.find(({ userUid }) => playerUid === userUid);
    if (player?.side !== this.process.turnSide) {
      throw new ConflictException('Not your turn');
    }

    const from: Cell | undefined = this.process.getBoard().board.get(figure);
    const result = this.process.makeTurn(figure, cell);
    if (!from) throw new ConflictException('Turn impossible');

    this.saveMove(figure, cell, from, result);
    this.process.store.setNextTurnSide();
    return { result, prevCell: from, side: player.side };
  }

  public start(): void {
    this.isActive = true;
  }
}
