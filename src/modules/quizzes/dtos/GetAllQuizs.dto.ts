import { IsEnum, IsOptional } from 'class-validator';
import { CategoryType } from '../../../common/enums/categoies.enum';
import { difficultyLevelenum } from '../../../common/enums/difficultyLevel.enum';
import { QuizStatus } from '../../../common/enums/quizStatus.enum';

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
