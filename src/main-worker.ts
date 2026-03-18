import { NestFactory } from '@nestjs/core';
import { WorkerAppModule } from './worker-app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerAppModule, { bufferLogs: true });
  
  app.useLogger(app.get(Logger));

  // Handle explicit microservice graceful tear-downs locally (SIGTERM mapping)
  app.enableShutdownHooks();

  const logger = app.get(Logger);
  logger.log('Standalone Worker Application initialized and routing payloads headless.');
}
bootstrap();
