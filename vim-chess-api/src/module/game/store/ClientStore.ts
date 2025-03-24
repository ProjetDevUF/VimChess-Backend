import { Injectable } from '@nestjs/common';
import { Client } from '../entities';

@Injectable()
export class ClientStore {
  clients: Map<string, Client>;

  constructor() {
    this.clients = new Map();
  }

  setClient(socketId: string, client: Client): Client {
    for (const [socId, cl] of this.clients.entries()) {
      if (cl.userUid === client.userUid) {
        this.clients.delete(socId);
        cl.socket = client.socket;
        this.clients.set(socketId, cl);
        return cl;
      }
    }
    this.clients.set(socketId, client);
    return client;
  }

  getClient(socketId: string): Client {
    return <Client>this.clients.get(socketId);
  }
}
