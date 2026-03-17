import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobProcessor } from './job.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'task-queue',
    }),
  ],
  providers: [JobProcessor],
})
export class WorkersModule {}
