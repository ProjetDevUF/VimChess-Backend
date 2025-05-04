import { CompletedMove } from './end.types';

export class TurnEntity {
  result: CompletedMove;

  prevCell: string;

  side: 'w' | 'b';
}
