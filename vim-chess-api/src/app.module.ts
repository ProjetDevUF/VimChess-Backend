import { Module } from '@nestjs/common';
import { AuthModule, GameModule, UsersModule } from './module';
import { PrismaModule } from './prisma/prisma.module';
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    GameModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
