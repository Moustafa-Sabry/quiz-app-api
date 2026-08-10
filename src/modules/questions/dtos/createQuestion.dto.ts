import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateAnswerDto } from './createAnswer.dto';
import {
  AnswersEnum,
  CategoryType,
  difficultyLevelenum,
  QuestionType,
} from '../../../common/enums';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsArray()
  // @ArrayMinSize(4)
  // @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @IsNotEmpty()
  @IsEnum(AnswersEnum)
  correctAnswer: AnswersEnum;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  category: CategoryType;

  @IsNotEmpty()
  @IsEnum(difficultyLevelenum)
  difficultyLevel: difficultyLevelenum;
}
