import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MonitoringService {
  constructor(@InjectQueue('tasks') private readonly taskQueue: Queue) {}

  async getQueueMetrics() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.taskQueue.getWaitingCount(),
      this.taskQueue.getActiveCount(),
      this.taskQueue.getCompletedCount(),
      this.taskQueue.getFailedCount(),
      this.taskQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }

  async getJobs(page: number, limit: number) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    // Fetch all job types for comprehensive dashboard stream
    const jobs = await this.taskQueue.getJobs(
      ['waiting', 'active', 'completed', 'failed', 'delayed'], 
      start, 
      end
    );
    
    return Promise.all(jobs.map(async job => ({
      id: job.id,
      name: job.name,
      status: await job.getState(),
      attempts: job.attemptsMade,
      timestamp: job.timestamp
    })));
  }

  async getJobDetails(id: string) {
    const job = await this.taskQueue.getJob(id);
    if (!job) return null;

    const [logs, state] = await Promise.all([
      this.taskQueue.getJobLogs(id),
      job.getState()
    ]);

    return {
      id: job.id,
      status: state,
      progress: job.progress,
      attempts: job.attemptsMade,
      logs: logs.logs,
      timestamps: {
        created: job.timestamp,
        processed: job.processedOn,
        finished: job.finishedOn,
      },
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason
    };
  }
}
