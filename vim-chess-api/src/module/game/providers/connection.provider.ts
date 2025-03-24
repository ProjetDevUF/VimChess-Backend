import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client } from '../entities';

@Injectable()
export class ConnectionPatchProvider {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensService: TokenService,
  ) {}

  private async withToken(
    client: Client,
    payload: any,
    token: string,
  ): Promise<void> {
    try {
      const authorizedUserData = await this.authService.checkoutUserSession(
        payload.userId,
        payload.deviceId,
      );
      client.authorized = true;
      client.username = authorizedUserData.username;
      client.userUid = authorizedUserData.uid;
    } catch (e) {
      client.authorized = false;
      client.username = 'Anonymous';
      client.userUid = payload.userUid;
      client.anonymousTempToken = token;
    }
  }

  public async processClient(socket: Socket): Promise<Client> {
    const authToken = socket.handshake.query['Authorization'];
    const client = new Client(socket);

    try {
      const payload = await this.tokensService.parseToken(authToken as string);
      await this.withToken(client, payload, authToken as string);
    } catch (e) {}
    return client;
  }
}
