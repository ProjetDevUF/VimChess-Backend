import { PrismaService } from '../../../prisma/prisma.service';
import { CreateGameDto, UpdateGameDto } from '../dto';

export class GameModel {
  constructor(private prismaService: PrismaService) {}

  createGame(createGameDto: CreateGameDto) {
    return 'This action adds a new game';
  }

  findAllGame() {
    return `This action returns all game`;
  }

  findOneGame(id: number) {
    return `This action returns a #${id} game`;
  }

  updateGame(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
  }
}
