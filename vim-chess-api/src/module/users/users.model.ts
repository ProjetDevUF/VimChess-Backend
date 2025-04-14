import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import {UpdateUserDto} from "./dto/update-user.dto";

@Injectable()
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
}
