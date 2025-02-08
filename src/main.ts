import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Enable DTO validation
  await app.listen(3000);
  Logger.log('Invoice Service is running on http://localhost:3000');
}
bootstrap();
