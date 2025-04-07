import { PlainBoardStateDto } from './PlainBoardState.dto';

export type InitedGameDataDto = {
  board: PlainBoardStateDto;
  gameId: number;
  side: 'w' | 'b';
  maxTime: number;
};
