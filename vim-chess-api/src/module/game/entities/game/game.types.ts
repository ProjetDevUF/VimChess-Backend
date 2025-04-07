import { EchecData, MateData, StrikedData } from './end.types';

export type Cell = string;
export type Figure = string;
export type Figures = Map<Figure, Cell>;

export type FiguresCellState = {
  black: Map<Figure, Cell>;
  white: Map<Figure, Cell>;
};

export type FiguresSet = {
  w: Set<Figure>;
  b: Set<Figure>;
};

export type Board = {
  board: Figures;
  opponent: Figures;
};
export type CellUpdate = {
  prevCell: Cell;
  newCell: Cell;
};

export type Config = {
  side: 'w' | 'b' | 'rand';
};
type SimplifiedPlayer = {
  userUid: string;
  username: string;
  side: 'w' | 'b';
};
export type GameData = {
  id: number;
  players: SimplifiedPlayer[];
  config: Config;
};
export type GameResult = {
  id: number;
  config: Config;
  moves: Move[];
};
export type GameWithWinner = GameResult & {
  winner: SimplifiedPlayer;
  looser: SimplifiedPlayer;
};
export type DrawGame = GameResult & {
  pl1: SimplifiedPlayer;
  pl2: SimplifiedPlayer;
};
export type Move = {
  side: 'w' | 'b';
  figure: Figure;
  from: Cell;
  to: Cell;
  strikedData?: StrikedData;
  shahData?: EchecData;
  mateData?: MateData;
};
