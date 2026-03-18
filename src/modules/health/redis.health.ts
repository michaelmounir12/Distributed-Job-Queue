import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = new Redis({
        host: this.configService.get('redis.host'),
        port: this.configService.get('redis.port'),
        maxRetriesPerRequest: null,
      });
      await client.ping();
      client.disconnect();
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false, { message: e.message }));
    }
  }
}
