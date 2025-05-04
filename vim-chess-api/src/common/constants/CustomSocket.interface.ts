import { Socket } from 'socket.io';
import { Client } from '../../module/game/entities';

export interface CustomSocket extends Socket {
  customClient?: Client;
}
