import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxAttempts?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedToGroups?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  questions?: string[];

  @IsOptional()
  @IsBoolean()
  randomize?: boolean;
}
