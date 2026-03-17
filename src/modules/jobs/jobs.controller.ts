import { Controller, Post, Get, Body, Param, UseGuards, NotFoundException, HttpCode, HttpStatus } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { EmailJobDto } from './dto/email-job.dto';
import { VideoJobDto } from './dto/video-job.dto';
import { AiJobDto } from './dto/ai-job.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('email')
  @HttpCode(HttpStatus.ACCEPTED)
  async createEmailJob(@Body() emailJobDto: EmailJobDto) {
    return this.jobsService.createJob('email', emailJobDto, emailJobDto);
  }

  @Post('video')
  @HttpCode(HttpStatus.ACCEPTED)
  async createVideoJob(@Body() videoJobDto: VideoJobDto) {
    return this.jobsService.createJob('video', videoJobDto, videoJobDto);
  }

  @Post('ai')
  @HttpCode(HttpStatus.ACCEPTED)
  async createAiJob(@Body() aiJobDto: AiJobDto) {
    return this.jobsService.createJob('ai', aiJobDto, aiJobDto);
  }

  @Get(':id')
  async getStatus(@Param('id') id: string) {
    const status = await this.jobsService.getJobStatus(id);
    if (!status) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    return status;
  }
}
