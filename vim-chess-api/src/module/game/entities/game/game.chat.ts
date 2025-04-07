import { Client } from '../client.entity';

export type Message = {
  text: string;
  author: {
    uid: string;
    username: string;
  };
  date: Date;
};

export class GameChat {
  messages: Message[] = [];

  public addMessage(message: string, { userUid, username }: Client) {
    const messageObj = {
      text: message,
      author: { uid: userUid, username },
      date: new Date(),
    };
    this.messages.push(messageObj);
    return messageObj;
  }
}
