import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseJobDto } from './base-job.dto';

export class EmailJobDto extends BaseJobDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
