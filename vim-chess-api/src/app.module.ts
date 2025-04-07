import { Module } from '@nestjs/common';
import { AuthModule, GameModule, UsersModule } from './module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule, GameModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
