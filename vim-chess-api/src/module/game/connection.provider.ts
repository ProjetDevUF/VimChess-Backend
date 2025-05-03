import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/module/auth';
import { Socket } from 'socket.io';
import { Client } from './entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConnectionPatchProvider {
  constructor(private readonly authService: AuthService) {}

  private createAnonymousToken(client: Client): void {
    const userUid = uuidv4();
    const { token } = this.authService.anonymousToken(userUid);
    client.authorized = false;
    client.userUid = userUid;
    client.username = 'Anonymous';
    client.anonymousTempToken = token;
  }

  private async withToken(
    client: Client,
    payload: any,
    token: string,
  ): Promise<void> {
    try {
      console.log(client);
      console.log(token);
      console.log(payload);
      const authorizedUserData = await this.authService.checkoutUserSession(
        payload.userUid,
        payload.deviceId,
      );
      client.authorized = true;
      client.username = authorizedUserData.username;
      client.userUid = authorizedUserData.uid;
    } catch (e) {
      console.log(e);
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
      const payload = await this.authService.parseToken(authToken as string);
      await this.withToken(client, payload, authToken as string);
    } catch (e) {
      this.createAnonymousToken(client);
    }
    return client;
  }
}
