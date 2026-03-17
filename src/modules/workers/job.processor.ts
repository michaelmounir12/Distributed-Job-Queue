import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('tasks')
export class JobProcessor extends WorkerHost {
  private readonly logger = new Logger(JobProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);
    this.logger.debug(`Job payload: ${JSON.stringify(job.data)}`);

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 3000));

    this.logger.log(`Completed job ${job.id}`);
    return { success: true, processedAt: new Date().toISOString() };
  }
}
