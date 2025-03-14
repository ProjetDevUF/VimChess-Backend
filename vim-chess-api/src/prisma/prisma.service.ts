import { Catch, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientExceptionFilter } from 'src/prisma/exceptions/prisma-client-exception.filter';

@Injectable()
@Catch(PrismaClientExceptionFilter)
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
