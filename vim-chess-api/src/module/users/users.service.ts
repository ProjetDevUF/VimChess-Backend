import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersModel } from './users.model';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersModel: UsersModel) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(uid: string): Promise<User | null> {
    const user: User | null = await this.usersModel.findOneByUid(uid);
    return user ? new User(user) : null;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
