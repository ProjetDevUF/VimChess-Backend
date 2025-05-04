import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Client } from '../../module/game/entities';

export const GetClient = createParamDecorator(
  (data: keyof Client | undefined, ctx: ExecutionContext): any => {
    const client = ctx.switchToWs().getClient();
    if (!client) {
      return null;
    }
    const customClient: Client = client.customClient;
    if (data && customClient) {
      return customClient[data];
    }
    return customClient;
  },
);
