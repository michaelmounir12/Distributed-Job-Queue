import { IsOptional, IsInt, Min, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BackoffOptsDto {
  @IsOptional()
  type?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  delay?: number;
}

export class BaseJobDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  attempts?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  delay?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BackoffOptsDto)
  backoff?: BackoffOptsDto;
}
