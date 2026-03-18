import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobProcessor } from './job.processor';
import { EmailProcessorService } from './processors/email.processor.service';
import { VideoProcessorService } from './processors/video.processor.service';
import { AiProcessorService } from './processors/ai.processor.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tasks',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [
    JobProcessor,
    EmailProcessorService,
    VideoProcessorService,
    AiProcessorService,
  ],
})
export class WorkersModule {}
