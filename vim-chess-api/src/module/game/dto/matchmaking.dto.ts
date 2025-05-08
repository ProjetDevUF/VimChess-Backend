import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Client } from '../entities';
import { QueueDto } from './index';

/**
 * DTO for joining the matchmaking queue
 */
export class JoinQueueDto {
  /**
   * Optional preferred side (white or black)
   * If not provided, side will be randomly assigned
   */
  @IsOptional()
  @IsString()
  preferredSide?: 'w' | 'b';
}

/**
 * DTO for accepting a match
 */
export class AcceptMatchDto {
  /**
   * ID of the game to accept
   */
  @IsNumber()
  gameId: number;
}

/**
 * DTO for proposing a rematch
 */
export class RematchProposeDto {
  /**
   * ID of the completed game
   */
  @IsNumber()
  gameId: number;
}

/**
 * DTO for accepting a rematch
 */
export class RematchAcceptDto {
  /**
   * ID of the completed game
   */
  @IsNumber()
  gameId: number;
}

/**
 * DTO for rejecting a rematch
 */
export class RematchRejectDto {
  /**
   * ID of the completed game
   */
  @IsNumber()
  gameId: number;
}

/**
 * DTO for matchmaking queue status response
 */
export class QueueStatusDto {
  /**
   * Number of players in the queue
   */
  playersInQueue: number;

  /**
   * Current player's position in the queue
   */
  position: number;

  /**
   * Estimated wait time in seconds
   */
  estimatedWaitTime: number;

  /**
   * Current ELO range for matching
   */
  eloRange: number;

  players: { player1: QueueDto; player2: QueueDto } | undefined;
}

/**
 * DTO for match-found notification
 */
export class MatchFoundDto {
  /**
   * ID of the created game
   */
  gameId: number;

  /**
   * Opponent information
   */
  opponent: {
    username: string;
    elo: number;
  };
}

export class Queue {
  client: Client;
  timestamp: number;
  elo: number;
  preferredSide?: 'w' | 'b';
}
