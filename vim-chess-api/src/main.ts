import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {HttpExceptionFilter} from "./common/filters/http-exception.filter";

async function bootstrap() {
  const allowedOrigin =
    process.env.ENV === 'dev' ? 'http://localhost:3000' : '*';
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
    cors: {
      origin: allowedOrigin,
    },
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
