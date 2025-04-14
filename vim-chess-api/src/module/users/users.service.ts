import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersModel } from './users.model';
import { UserEntity as User } from './entities/user.entity';
import { ERROR } from '../../common/constants/error.constants';

@Injectable()
export class UsersService {
  constructor(private readonly usersModel: UsersModel) {}

  async findOne(uid: string): Promise<User> {
    const user: User | null = await this.usersModel.findOneByUid(uid);
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return new User(user);
  }

  async update(uid: string, updateUserDto: UpdateUserDto) {
    const user: User | null = await this.usersModel.findOneByUid(uid);
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return this.usersModel.updateUser(uid, updateUserDto);
  }

  async remove(uid: string) {
    const user: User | null = await this.usersModel.findOneByUid(uid);
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return this.usersModel.deleteUser(uid);
  }
}
