import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

export class UsersModel {
  constructor(private prismaService: PrismaService) {}

  findOneByUid(userUid: string) {
    return this.prismaService.user.findUnique({
      where: { uid: userUid },
      include: {
        Role: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        Role: true,
      },
    });
  }

  updateRefreshToken(uid: string, refreshToken: string) {
    return this.prismaService.user.update({
      where: {
        uid,
      },
      data: {
        refreshToken,
      },
    });
  }

  createUser(userDto: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        ...userDto,
        roleId: 2,
      },
    });
  }
}
