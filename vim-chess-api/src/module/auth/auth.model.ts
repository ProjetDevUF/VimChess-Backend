import { PrismaService } from '../../prisma/prisma.service';
import { SessionEntity } from './entity/session.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthModel {
  constructor(private prismaService: PrismaService) {}

  public createSession(
    userUid: string,
    refreshToken: string,
    deviceId: string,
  ): Promise<SessionEntity> {
    return this.prismaService.session.create({
      data: {
        userUid,
        deviceId,
        refreshToken,
      },
    });
  }

  public deleteSession(id: number): Promise<SessionEntity> {
    return this.prismaService.session.delete({ where: { id } });
  }

  public findSession(refreshToken: string): Promise<SessionEntity | null> {
    return this.prismaService.session.findFirst({
      where: { refreshToken },
      include: { User: true },
    });
  }

  public findSessionByUserId(uid: string, deviceId: string) {
    return this.prismaService.session.findFirst({
      select: {
        id: true,
        User: {
          select: {
            uid: true,
            username: true,
          },
        },
        expiresIn: true,
        deviceId: true,
        refreshToken: true,
      },
      where: { userUid: uid, deviceId },
    });
  }

  public deleteSessionByUserId(uid: string, deviceId: string) {
    return this.prismaService.session.deleteMany({
      where: { userUid: uid, deviceId },
    });
  }

  public updateRefreshToken(user: any, refreshToken: string) {
    return this.prismaService.user.update({
      where: { uid: user.uid },
      data: { refreshToken },
    });
  }
}
