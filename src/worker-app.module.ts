import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { redisConfig } from './config/configuration';
import { WorkersModule } from './modules/workers/workers.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: { singleLine: true },
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy: (times) => Math.min(times * 100, 3000), // Stable connection retries for workers
        },
      }),
      inject: [ConfigService],
    }),
    WorkersModule,
  ],
})
export class WorkerAppModule {}
