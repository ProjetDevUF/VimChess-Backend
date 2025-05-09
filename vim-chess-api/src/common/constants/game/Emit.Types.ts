export enum Lobby {
  update = 'lobby:update',
}

export enum GameEnd {
  surrender = 'surrender',
  draw = 'draw',
  mate = 'mate',
  playerLeave = 'playerLeave',
}

export enum Game {
  pendingGame = 'game:pending-one',
  created = 'game:created',
  init = 'game:init-data',
  start = 'game:start',
  end = 'game:end',
  rejectDraw = 'game:draw_rejected',
  boardUpdate = 'game:board-update',
  message = 'game:chat-message',
  drawPropose = 'game:draw_propose',
  playerDiconnected = 'game:opponent-disconnected',
  playerReconected = 'game:player-reconnected',
}

export enum User {
  anonymousToken = 'user:anon-token',
  connected = 'user:connected',
}

/**
 * Events related to matchmaking
 */
export enum Matchmaking {
  joinQueue = 'matchmaking:join_queue',
  leaveQueue = 'matchmaking:leave_queue',
  timeout = 'matchmaking:timeout',
  queueStatus = 'matchmaking:queue_status',
  rematchPropose = 'matchmaking:rematch_propose',
  rematchAccept = 'matchmaking:rematch_accept',
  rematchReject = 'matchmaking:rematch_reject',
}

/**
 *
 * @param id
 * @returns string: game:{id}
 */
export const room = (id: number) => `game:${id}`;
