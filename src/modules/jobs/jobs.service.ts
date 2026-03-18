import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { BaseJobDto } from './dto/base-job.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectQueue('tasks') private readonly taskQueue: Queue) {}

  private extractOptions(dto: BaseJobDto): JobsOptions {
    const options: JobsOptions = {};
    if (dto.attempts !== undefined) options.attempts = dto.attempts;
    if (dto.delay !== undefined) options.delay = dto.delay;
    if (dto.backoff) {
      options.backoff = {
        type: dto.backoff.type || 'fixed',
        delay: dto.backoff.delay || 0,
      };
    }
    return options;
  }

  async createJob(type: string, payload: any, optionsDto?: BaseJobDto) {
    const options = optionsDto ? this.extractOptions(optionsDto) : {};
    const job = await this.taskQueue.add(type, payload, options);
    
    this.logger.log(`Created job ${job.id} of type "${type}"`, { payload, options });
    
    const response: any = {
      jobId: job.id,
      name: job.name,
      status: 'pending'
    };

    if (options.delay) {
      response.scheduledExecutionTime = new Date(Date.now() + options.delay).toISOString();
    }
    
    return response;
  }

  async getJobStatus(id: string) {
    const job = await this.taskQueue.getJob(id);
    if (!job) return null;
    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      attempts: job.attemptsMade,
      failedReason: job.failedReason,
      result: job.returnvalue,
    };
  }
}
