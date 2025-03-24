import { Injectable } from '@nestjs/common';
import { CreateGameDto, UpdateGameDto } from '../dto';
import { GameModel } from '../models/game.model';

@Injectable()
export class GameService {
  constructor(private gameModel: GameModel) {}

  create(createGameDto: CreateGameDto) {
    return this.gameModel.createGame(createGameDto);
  }

  findAll() {
    return this.gameModel.findAllGame();
  }

  findOne(id: number) {
    return this.gameModel.findOneGame(id);
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return this.gameModel.updateGame(id, updateGameDto);
  }
}
