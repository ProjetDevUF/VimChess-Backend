import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersModel } from './users.model';
import { UserEntity as User } from './entities/user.entity';
import { ERROR } from '../../common/constants/error.constants';

@Injectable()
export class UsersService {
  constructor(private readonly usersModel: UsersModel) {}

  async findOne(uid: string): Promise<User> {
    const user = await this.usersModel.findOneByUid(uid);
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    const stats = await this.usersModel.getGameStats(uid);
    return new User({ ...user, ...stats });
  }

  async update(uid: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersModel.findOneByUid(uid);
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return this.usersModel.updateUser(uid, updateUserDto);
  }

  async remove(uid: string) {
    const user = await this.usersModel.findOneByUid(uid);
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return this.usersModel.deleteUser(uid);
  }

  async getConnectedUsers(): Promise<User[]> {
    const users = await this.usersModel.getConnectedUsers();
    return await Promise.all(
      users.map(async (user) => {
        const stats = await this.usersModel.getGameStats(user.uid);
        return new User({ ...user, ...stats });
      }),
    );
  }
}
