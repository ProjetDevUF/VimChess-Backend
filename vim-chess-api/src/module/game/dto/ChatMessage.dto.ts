import { IsNumber, IsString, MinLength } from 'class-validator';

export class ChatMessage {
  @MinLength(1)
  @IsString()
  text: string;

  @IsNumber()
  gameId: number;
}
