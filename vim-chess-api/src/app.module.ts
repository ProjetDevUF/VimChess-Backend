import { Module } from '@nestjs/common';
import { AuthModule, GameModule, UsersModule } from './module';

@Module({
  imports: [UsersModule, GameModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
