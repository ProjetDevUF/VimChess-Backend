import { Client } from '../..';

type Message = {
  text: string;
  author: {
    uid: string;
    username: string;
  };
  gameId: number;
  date: Date;
};

export class GameChat {
  messages: Message[] = [];

  constructor(private gameId: number) {}

  public addMessage(message: string, { userUid, username }: Client) {
    const messageObj = {
      text: message,
      gameId: this.gameId,
      author: { uid: userUid, username },
      date: new Date(),
    };
    this.messages.push(messageObj);
    return messageObj;
  }
}
