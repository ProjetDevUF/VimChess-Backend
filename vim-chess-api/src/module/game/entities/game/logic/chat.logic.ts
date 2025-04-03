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

  public addMessage(
    message: string,
    gameId: number,
    { userUid, username }: Client,
  ) {
    const messageObj = {
      text: message,
      gameId,
      author: { uid: userUid, username },
      date: new Date(),
    };
    this.messages.push(messageObj);
    return messageObj;
  }
}
