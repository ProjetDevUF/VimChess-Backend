import { Injectable } from '@nestjs/common';
import { Client } from '../entities';
import { GameManagementService } from './GameMagement.service';
import { GameModel } from '../game.model';
import { LoggerService } from '../../../common/filters/logger';
import { Matchmaking } from '../../../common/constants/game/Emit.Types';
import { QueueDto, QueueStatusDto } from '../dto';

/**
 * Service responsible for matchmaking functionality
 * Manages a queue of players waiting for a match
 * Matches players based on their ELO rating
 * Creates games when matches are found
 */
@Injectable()
export class GameMatchmakingService {
  private readonly loggerService: LoggerService = new LoggerService();
  private queue: QueueDto[] = [];
  private timeoutIds: Map<string, NodeJS.Timeout> = new Map();
  private rematchProposals: Map<
    number,
    { proposer: string; timestamp: number }
  > = new Map();
  private readonly MAX_WAIT_TIME = 60000; // 60 seconds
  private readonly ELO_RANGE_INCREMENT = 50; // Increase ELO range by this amount every 5 seconds
  private readonly INITIAL_ELO_RANGE = 100; // Initial ELO range for matching
  private readonly REMATCH_PROPOSAL_TIMEOUT = 30000; // 30 seconds to accept a rematch

  constructor(
    private readonly gameManagementService: GameManagementService,
    private readonly gameModel: GameModel,
  ) {
    this.loggerService.setContext(GameMatchmakingService.name);
  }

  /**
   * Add a player to the matchmaking queue
   * @param client The client to add to the queue
   * @param preferredSide The preferred side
   * @returns A promise that resolves when the player is added to the queue
   */
  public async addToQueue(client: Client, preferredSide?: 'w' | 'b') {
    // Get the player's ELO from the database
    const users = await this.gameModel.getConnectedUsers();
    const user = users.find((u) => u.uid === client.userUid);

    if (!user) {
      this.loggerService.error(`User ${client.userUid} not found in database`);
      return;
    }

    const elo = user.elo;

    // Check if a player is already in the queue
    const existingIndex = this.queue.findIndex(
      (item) => item.client.userUid === client.userUid,
    );

    if (existingIndex !== -1) {
      this.loggerService.log(
        `Player ${client.username} already in queue, updating ELO`,
      );
      this.queue[existingIndex] = {
        client,
        timestamp: Date.now(),
        elo,
        preferredSide,
      };
      return;
    }

    // Add player to the queue
    this.queue.push({ client, timestamp: Date.now(), elo, preferredSide });
    this.loggerService.log(
      `Added player ${client.username} to matchmaking queue with ELO ${elo}`,
    );

    // Set a timeout to remove the player from the queue if they wait too long
    const timeoutId = setTimeout(() => {
      this.removeFromQueue(client);
      client.socket.emit(Matchmaking.timeout);
    }, this.MAX_WAIT_TIME);

    this.timeoutIds.set(client.userUid, timeoutId);

    // Try to find a match immediately
    return this.findMatch();
  }

  /**
   * Remove a player from the matchmaking queue
   * @param client The client to remove from the queue
   */
  public removeFromQueue(client: Client): void {
    const index = this.queue.findIndex(
      (item) => item.client.userUid === client.userUid,
    );

    if (index !== -1) {
      this.queue.splice(index, 1);
      this.loggerService.log(
        `Removed player ${client.username} from matchmaking queue`,
      );
    }

    // Clear the timeout if it exists
    const timeoutId = this.timeoutIds.get(client.userUid);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(client.userUid);
    }
  }

  /**
   * Find a match for players in the queue
   * Players are matched based on their ELO rating
   * The ELO range increases over time to ensure players find a match
   */
  private findMatch(): { player1: QueueDto; player2: QueueDto } | undefined {
    if (this.queue.length < 2) {
      return; // Need at least 2 players to make a match
    }

    // Sort queue by timestamp (oldest first)
    this.queue.sort((a, b) => a.timestamp - b.timestamp);

    // Try to find matches
    for (let i = 0; i < this.queue.length; i++) {
      const player1 = this.queue[i];
      if (!player1) continue; // Skip if the player was removed

      // Calculate ELO range based on wait time
      const waitTime = Date.now() - player1.timestamp;
      const eloRange =
        this.INITIAL_ELO_RANGE +
        Math.floor(waitTime / 5000) * this.ELO_RANGE_INCREMENT;

      // Find a match within ELO range
      for (let j = 0; j < this.queue.length; j++) {
        if (i === j) continue; // Skip self

        const player2 = this.queue[j];
        if (!player2) continue; // Skip if the player was removed

        // Check if the ELO difference is within range
        if (Math.abs(player1.elo - player2.elo) <= eloRange) {
          // Match found!

          // Remove both players from the queue
          this.removeFromQueue(player1.client);
          this.removeFromQueue(player2.client);
          //console.log(player1.client, player2.client);
          return { player1, player2 };
        }
      }
    }
  }

  /**
   * Get the current matchmaking queue
   * @returns The current queue
   */
  /**
   * Get the current matchmaking queue status
   * @param client Optional client to get position for
   * @returns Queue status information
   */
  public getQueueStatus(client?: Client): QueueStatusDto {
    const playersInQueue = this.queue.length;
    let position = -1;
    let waitTime = 0;
    let eloRange = this.INITIAL_ELO_RANGE;

    if (client) {
      const playerIndex = this.queue.findIndex(
        (item) => item.client.userUid === client.userUid,
      );

      if (playerIndex !== -1) {
        position = playerIndex + 1;
        waitTime = Math.floor(
          (Date.now() - this.queue[playerIndex].timestamp) / 1000,
        );
        eloRange =
          this.INITIAL_ELO_RANGE +
          Math.floor(waitTime / 5) * this.ELO_RANGE_INCREMENT;
      }
    }

    // Estimate wait time based on queue length and current matching rate
    const estimatedWaitTime =
      position === -1 ? 0 : Math.max(10, waitTime + position * 5);

    const players = this.findMatch();
    return {
      playersInQueue,
      position,
      estimatedWaitTime,
      eloRange,
      players,
    };
  }

  /**
   * Get detailed information about players in the queue (for admin/debug purposes)
   * @returns Array of player information
   */
  public getQueueDetails(): {
    username: string;
    elo: number;
    waitTime: number;
  }[] {
    return this.queue.map((item) => ({
      username: item.client.username,
      elo: item.elo,
      waitTime: Math.floor((Date.now() - item.timestamp) / 1000),
    }));
  }

  /**
   * Propose a rematch between two players
   * @param gameId The ID of the completed game
   * @param proposer The client proposing the rematch
   * @returns True if the rematch was proposed, false otherwise
   */
  public proposeRematch(gameId: number, proposer: Client): boolean {
    try {
      // Check if a rematch has already been proposed for this game
      if (this.rematchProposals.has(gameId)) {
        this.loggerService.log(`Rematch already proposed for game ${gameId}`);
        return false;
      }

      // Store the rematch proposal
      this.rematchProposals.set(gameId, {
        proposer: proposer.userUid,
        timestamp: Date.now(),
      });

      this.loggerService.log(
        `Rematch proposed for game ${gameId} by ${proposer.username}`,
      );

      // Set a timeout to automatically reject the rematch if not accepted in time
      const timeoutId = setTimeout(() => {
        this.rejectRematch(gameId, proposer);
      }, this.REMATCH_PROPOSAL_TIMEOUT);

      this.timeoutIds.set(`rematch_${gameId}`, timeoutId);

      return true;
    } catch (error) {
      this.loggerService.error(`Error proposing rematch: ${error.message}`);
      return false;
    }
  }

  /**
   * Accept a rematch proposal
   * @param gameId The ID of the completed game
   * @param accepter The client accepting the rematch
   * @returns The ID of the new game, or null if the rematch couldn't be created
   */
  public async acceptRematch(
    gameId: number,
    accepter: Client,
  ): Promise<number | null> {
    try {
      // Check if a rematch has been proposed for this game
      const proposal = this.rematchProposals.get(gameId);
      if (!proposal) {
        this.loggerService.log(`No rematch proposal found for game ${gameId}`);
        return null;
      }

      // Clear the timeout
      const timeoutId = this.timeoutIds.get(`rematch_${gameId}`);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.timeoutIds.delete(`rematch_${gameId}`);
      }

      // Remove the proposal
      this.rematchProposals.delete(gameId);

      // Get the proposer client
      const game = this.gameManagementService.findGameById(gameId);
      const proposerPlayer = game.players.find(
        (p) => p.userUid === proposal.proposer,
      );

      if (!proposerPlayer) {
        this.loggerService.error(`Proposer not found for game ${gameId}`);
        return null;
      }

      // Create a new game with swapped sides
      const accepterSide = proposerPlayer.side === 'w' ? 'b' : 'w';
      const newGame = await this.gameManagementService.createGame(accepter, {
        side: accepterSide,
      });

      this.loggerService.log(
        `Rematch accepted for game ${gameId}, created new game ${newGame.id}`,
      );

      return newGame.id;
    } catch (error) {
      this.loggerService.error(`Error accepting rematch: ${error.message}`);
      return null;
    }
  }

  /**
   * Reject a rematch proposal
   * @param gameId The ID of the completed game
   * @param rejecter The client rejecting the rematch
   */
  public rejectRematch(gameId: number, rejecter: Client): void {
    try {
      // Check if a rematch has been proposed for this game
      if (!this.rematchProposals.has(gameId)) {
        return;
      }

      // Clear the timeout
      const timeoutId = this.timeoutIds.get(`rematch_${gameId}`);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.timeoutIds.delete(`rematch_${gameId}`);
      }

      // Remove the proposal
      this.rematchProposals.delete(gameId);

      this.loggerService.log(
        `Rematch rejected for game ${gameId} by ${rejecter.username}`,
      );
    } catch (error) {
      this.loggerService.error(`Error rejecting rematch: ${error.message}`);
    }
  }
}
