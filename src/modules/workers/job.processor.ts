import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailProcessorService } from './processors/email.processor.service';
import { VideoProcessorService } from './processors/video.processor.service';
import { AiProcessorService } from './processors/ai.processor.service';

@Processor('tasks')
export class JobProcessor extends WorkerHost {
  private readonly logger = new Logger(JobProcessor.name);

  constructor(
    private readonly emailProcessor: EmailProcessorService,
    private readonly videoProcessor: VideoProcessorService,
    private readonly aiProcessor: AiProcessorService,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Lifecycle: Starting job ${job.id} of type "${job.name}"`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number | object) {
    this.logger.debug(`Lifecycle: Job ${job.id} progress updated to ${progress}%`); // standard percentage
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Lifecycle: Successfully completed job ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Lifecycle: Job ${job.id} failed with reason: ${error.message} - Automatic retry mechanisms will execute based strictly on the backoff strategy mapped in Redis.`);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Routing job ${job.id} of type "${job.name}"...`);
    
    try {
      switch (job.name) {
        case 'email':
          return await this.emailProcessor.process(job);
        case 'video':
          return await this.videoProcessor.process(job);
        case 'ai':
          return await this.aiProcessor.process(job);
        default:
          this.logger.warn(`Unknown job type received: ${job.name}`);
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${(error as any).message}`);
      throw error; // Rethrow to ensure BullMQ intercepts and schedules a retry
    }
  }
}
