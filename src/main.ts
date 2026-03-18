import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  // Use structured Pino logger globally instead of Nest built-in
  app.useLogger(app.get(Logger));

  // Ensure graceful terminations block unfulfilled requests
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpErrorFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  
  await app.listen(port);
  app.get(Logger).log(`Production API Interface listening on ports: ${port}`);
}
bootstrap();
