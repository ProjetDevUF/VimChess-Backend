export type StrikedData = {
  strikedSide: 'w' | 'b';
  figure: string;
  cell: string;
};
export type EchecData = {
  echecSide: 'w' | 'b';
  byFigure: string;
};
export type MateData = {
  matedSide: 'w' | 'b';
  byFigure: string;
};

export type CompletedMove = {
  mate: null | MateData;
  shah: null | EchecData;
  strike: null | StrikedData;
};
