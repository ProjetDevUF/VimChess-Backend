import { Injectable } from '@nestjs/common';
import stockfish from 'stockfish';

@Injectable()
export class StockfishService {
  private engine: any;

  constructor() {
    this.initEngine();
  }

  private initEngine() {
    this.engine = typeof stockfish === 'function' ? stockfish() : stockfish;

    if (!this.engine) {
      throw new Error("Impossible d'initialiser Stockfish");
    }

    // Configuration de base
    this.sendCommand('uci');
    this.sendCommand('ucinewgame');
  }

  private sendCommand(command: string) {
    if (this.engine && typeof this.engine.postMessage === 'function') {
      this.engine.postMessage(command);
    }
  }

  public getBestMove(fen: string): Promise<string> {
    return new Promise((resolve) => {
      this.sendCommand(`position fen ${fen}`);

      // Demander le meilleur coup
      this.sendCommand('go depth 10');

      // Écouter les réponses de Stockfish
      const listener = (event: any) => {
        const message = event.data;

        // Extraire le meilleur coup
        if (message.startsWith('bestmove')) {
          const bestMove = message.split(' ')[1];
          this.engine.removeEventListener('message', listener);
          resolve(bestMove);
        }
      };

      this.engine.addEventListener('message', listener);
    });
  }

  // Méthode pour obtenir l'évaluation de la position
  public getEvaluation(fen: string): Promise<number> {
    return new Promise((resolve) => {
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand('eval');

      const listener = (event: any) => {
        const message = event.data;

        // Extraire l'évaluation (à adapter selon la sortie exacte de Stockfish)
        if (message.includes('Total Evaluation')) {
          const evaluation = parseFloat(message.split('Total Evaluation')[1]);
          this.engine.removeEventListener('message', listener);
          resolve(evaluation);
        }
      };

      this.engine.addEventListener('message', listener);
    });
  }

  // Exemple de méthode pour intégrer dans votre gateway
  async findBestMove(currentPosition: string) {
    try {
      const bestMove = await this.getBestMove(currentPosition);
      const evaluation = await this.getEvaluation(currentPosition);

      return {
        bestMove,
        evaluation,
      };
    } catch (error) {
      console.error('Erreur avec Stockfish:', error);
      throw error;
    }
  }
}
