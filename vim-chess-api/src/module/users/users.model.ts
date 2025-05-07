import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersModel {
  constructor(private prismaService: PrismaService) {}

  findOneByUid(userUid: string) {
    return this.prismaService.user.findUnique({
      where: { uid: userUid },
      select: {
        uid: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        country: true,
        elo: true,
        refreshToken: true,
        createdAt: true,
        updatedAt: true,
        Role: {
          select: {
            id: true,
            role: true,
          },
        },
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

  deleteUser(uid: string) {
    return this.prismaService.user.delete({
      where: {
        uid,
      },
    });
  }

  updateUser(uid: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: {
        uid,
      },
      data: {
        ...updateUserDto,
      },
    });
  }

  async getGameStats(userUid: string) {
    const wins = await this.prismaService.game.count({
      where: {
        uid_winner: userUid,
      },
    });

    const losses = await this.prismaService.game.count({
      where: {
        uid_looser: userUid,
      },
    });

    const draws = await this.prismaService.game.count({
      where: {
        is_draw: true,
        OR: [{ uid_white: userUid }, { uid_black: userUid }],
      },
    });

    return { wins, losses, draws };
  }

  getConnectedUsers() {
    return this.prismaService.user.findMany({
      where: {
        connect: true,
      },
      select: {
        uid: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        country: true,
        elo: true,
        connect: true,
        refreshToken: true,
        createdAt: true,
        updatedAt: true,
        Role: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });
  }
}
