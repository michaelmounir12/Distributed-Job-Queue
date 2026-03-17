import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(@InjectQueue('task-queue') private readonly taskQueue: Queue) {}

  async createJob(createJobDto: CreateJobDto) {
    const job = await this.taskQueue.add(createJobDto.type, createJobDto.payload);
    return {
      jobId: job.id,
      name: job.name,
      status: 'pending'
    };
  }

  async getJobStatus(id: string) {
    const job = await this.taskQueue.getJob(id);
    if (!job) return null;
    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
    };
  }
}
