import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
export class EmailProcessorService {
  private readonly logger = new Logger(EmailProcessorService.name);

  async process(job: Job) {
    this.logger.log(`Starting to process email job ${job.id}`, { to: job.data.to, subject: job.data.subject });
    
    await job.updateProgress(10);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random network failure for retries demonstration
    if (Math.random() < 0.2) {
      const error = new Error('Simulated SMTP connection timeout');
      this.logger.error(`Error sending email for job ${job.id}: ${error.message}`);
      throw error;
    }

    await job.updateProgress(100);
    this.logger.log(`Successfully completed email job ${job.id}`);
    return { delivered: true, timestamp: new Date().toISOString() };
  }
}
