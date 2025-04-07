import { Injectable } from '@nestjs/common';
import { GameData } from './entities/game';
import { Client } from './entities';
import { Game } from './entities/game/game.entity';

@Injectable()
export class GameList {
  lobby: Game[];
  games: Game[];

  constructor() {
    this.lobby = [];
    this.games = [];
  }

  public addGameToLobby(game: Game): void {
    this.lobby.push(game);
  }

  public findInLobby(id: number): Game | null {
    return this.lobby.find((game) => game.id === id) || null;
  }

  public gameEnd(id: number) {
    this.games = this.games.filter((g) => g.id !== id);
  }

  public pushToStartedGames(gameId: number): void {
    const index: number = this.lobby.findIndex(
      (game: Game) => game.id === gameId,
    );
    this.games.push(this.lobby[index]);
    this.lobby.splice(index, 1);
  }

  public removeInitedGames({ userUid }: Client): void {
    this.lobby = this.lobby.filter((game) => {
      return game.players.find((pl) => pl.userUid !== userUid);
    });
  }

  public findPendingClientGame({ userUid }: Client): Game | null {
    const game = this.games.find((g) => {
      return g.players.find((pl) => pl.userUid === userUid);
    });
    return game?.isActive ? game : null;
  }

  public getLobby(): GameData[] {
    return this.lobby.map((game) => {
      return {
        id: game.id,
        players: game.players.map(({ userUid, username, side }) => {
          return { userUid, username, side };
        }),
        config: game.config,
      };
    });
  }
}
