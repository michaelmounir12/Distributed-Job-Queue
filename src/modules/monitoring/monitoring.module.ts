import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tasks',
    }),
    AuthModule,
    ConfigModule,
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
