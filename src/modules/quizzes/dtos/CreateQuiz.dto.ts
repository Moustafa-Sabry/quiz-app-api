import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  difficultyLevelenum,
  Duration,
  CategoryType,
} from '../../../common/enums';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsNotEmpty()
  @IsEnum(Duration)
  duration: Duration;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  numberOfQuestions: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  scorePerQuestion: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxAttempts?: number;

  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @IsNotEmpty()
  @IsEnum(difficultyLevelenum)
  difficultyLevel: difficultyLevelenum;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  category: CategoryType;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  assignedToGroups: string[];

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  questions: string[];

  @IsOptional()
  @IsBoolean()
  randomize?: boolean;

  @IsNotEmpty()
  @IsMongoId()
  createdBy: string;
}
