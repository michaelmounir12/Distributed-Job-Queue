import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsOptional()
  payload: Record<string, any>;
}
