import { IsEnum, IsOptional } from 'class-validator';
import {
  CategoryType,
  difficultyLevelenum,
  QuizStatus,
} from '../../../common/enums';

export class GetQuizzesDto {
  @IsOptional()
  @IsEnum(CategoryType)
  category?: CategoryType;

  @IsOptional()
  @IsEnum(difficultyLevelenum)
  difficultyLevel?: difficultyLevelenum;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;
}
