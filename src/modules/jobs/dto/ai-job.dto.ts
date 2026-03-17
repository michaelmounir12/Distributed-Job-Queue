import { IsNotEmpty, IsString } from 'class-validator';
import { BaseJobDto } from './base-job.dto';

export class AiJobDto extends BaseJobDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
