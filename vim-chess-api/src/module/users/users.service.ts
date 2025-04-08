import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersModel } from './users.model';
import { UserEntity as User } from './entities/user.entity';
import { ERROR } from '../../common/constants/error.constants';

@Injectable()
export class UsersService {
  constructor(private readonly usersModel: UsersModel) {}

  findAll() {
    return `This action returns all users`;
  }

  async findOne(uid: string): Promise<User> {
    const user: User | null = await this.usersModel.findOneByUid(uid);
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return new User(user);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
