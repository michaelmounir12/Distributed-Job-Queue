import { Controller, Get, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('queues')
  async getQueueStats() {
    return this.monitoringService.getQueueMetrics();
  }

  @Get('jobs')
  async getJobs(
    @Query('page') page: string = '1', 
    @Query('limit') limit: string = '10'
  ) {
    return this.monitoringService.getJobs(parseInt(page, 10), parseInt(limit, 10));
  }

  @Get('jobs/:id')
  async getJobDetails(@Param('id') id: string) {
    const details = await this.monitoringService.getJobDetails(id);
    if (!details) {
      throw new NotFoundException(`Job ${id} not found in queue system`);
    }
    return details;
  }
}
