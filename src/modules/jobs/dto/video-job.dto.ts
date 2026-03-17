import { IsUrl, IsNotEmpty, IsString } from 'class-validator';
import { BaseJobDto } from './base-job.dto';

export class VideoJobDto extends BaseJobDto {
  @IsUrl()
  @IsNotEmpty()
  videoUrl: string;

  @IsString()
  @IsNotEmpty()
  format: string;
}
