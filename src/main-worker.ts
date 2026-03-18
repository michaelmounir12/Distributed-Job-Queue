import { NestFactory } from '@nestjs/core';
import { WorkerAppModule } from './worker-app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  // Create an application context without booting the HTTP server
  const app = await NestFactory.createApplicationContext(WorkerAppModule);
  
  app.enableShutdownHooks();
  logger.log('Standalone Worker Application is running and listening for jobs...');
}
bootstrap();
