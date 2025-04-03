import { Figures, Figure, Cell, FiguresSet, EchecData } from '..';

export class GameState {
  blackBoard: Figures;
  whiteBoard: Figures;
  echecData: null | EchecData;
  possibleEchec: FiguresSet;
  strikeAroundKn: FiguresSet;

  sideToTurn: 'w' | 'b';

  constructor(white: Figures, black: Figures) {
    this.blackBoard = black;
    this.whiteBoard = white;
    this.sideToTurn = 'w';
    this.possibleEchec = { w: new Set(), b: new Set() };
    this.strikeAroundKn = { w: new Set(), b: new Set() };
    this.echecData = null;
  }

  public updateBoard(figure: Figure, cell: Cell): void {
    if (this.sideToTurn == 'w') {
      this.whiteBoard.set(figure, cell);
    } else {
      this.blackBoard.set(figure, cell);
    }
  }

  public removeEchec(): void {
    this.echecData = null;
  }

  public getBlack(): Figures {
    return new Map(this.blackBoard);
  }

  public getWhite(): Figures {
    return new Map(this.whiteBoard);
  }

  get state() {
    return { w: this.getWhite(), b: this.getBlack() };
  }

  get side() {
    return this.sideToTurn;
  }

  setNextTurnSide() {
    this.sideToTurn = this.sideToTurn == 'w' ? 'b' : 'w';
  }

  set turnSide(side: 'w' | 'b') {
    this.sideToTurn = side;
  }

  get echec(): EchecData | null {
    return this.echecData ? { ...this.echecData } : null;
  }

  public setEchecData(toSide: 'w' | 'b', byFigure: Figure): void {
    this.echecData = {
      echecSide: toSide,
      byFigure,
    };
  }

  public removePossibleEchec(forSide: 'w' | 'b', figure: Figure): void {
    this.possibleEchec[forSide].delete(figure);
  }

  public getPossibleEchec(side: 'w' | 'b'): Set<Figure> {
    return new Set(this.possibleEchec[side]);
  }

  public getStrikeAroundKn(): FiguresSet {
    return this.strikeAroundKn;
  }

  public setPossibleEchec(side: 'w' | 'b', figure: Figure): void {
    this.possibleEchec[side].add(figure);
  }

  public setStrikeAroundKn(side: 'w' | 'b', figure: Figure): void {
    this.strikeAroundKn[side].add(figure);
  }

  public removeFigure(side: 'w' | 'b', figure: Figure): void {
    if (side === 'w') {
      this.whiteBoard.delete(figure);
      this.possibleEchec['b'].delete(figure);
      this.strikeAroundKn['b'].delete(figure);
    } else {
      this.blackBoard.delete(figure);
      this.possibleEchec['w'].delete(figure);
      this.strikeAroundKn['w'].delete(figure);
    }
  }
}
