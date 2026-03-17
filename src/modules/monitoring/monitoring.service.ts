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
      queueName: this.taskQueue.name,
      metrics: {
        waiting,
        active,
        completed,
        failed,
        delayed,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
