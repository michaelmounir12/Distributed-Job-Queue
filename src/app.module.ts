import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { redisConfig, jwtConfig } from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { WorkersModule } from './modules/workers/workers.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    PrometheusModule.register(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // strictly rate limit application layer endpoint hammering 
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, jwtConfig],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy: (times) => {
            return Math.min(times * 100, 3000); // Reconnect identically across disruptions
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    JobsModule,
    WorkersModule,
    MonitoringModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // globally apply to everything
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
