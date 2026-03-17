import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobProcessor } from './job.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tasks',
    }),
  ],
  providers: [JobProcessor],
})
export class WorkersModule {}
