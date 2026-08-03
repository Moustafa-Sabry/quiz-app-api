import {
  ArrayMaxSize,
  ArrayMinSize,
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
import { AnswersEnum } from '../../../common/enums/Answers.enum';
import { CategoryType } from '../../../common/enums/categoies.enum';
import { difficultyLevelenum } from '../../../common/enums/difficultyLevel.enum';

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
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @IsNotEmpty()
  @IsEnum(AnswersEnum)
  correctAnswer: AnswersEnum;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  category: CategoryType;

  @IsNotEmpty()
  @IsEnum(difficultyLevelenum)
  difficultyLevel: difficultyLevelenum;
}
