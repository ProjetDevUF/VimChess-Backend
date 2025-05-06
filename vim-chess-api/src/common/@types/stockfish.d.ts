// @types/stockfish.d.ts
declare module 'stockfish' {
  interface Stockfish {
    postMessage(message: string): void;

    addEventListener(event: string, callback: (data: any) => void): void;

    removeEventListener(event: string, callback: (data: any) => void): void;
  }

  function stockfish(): Stockfish;

  export = stockfish;
}
