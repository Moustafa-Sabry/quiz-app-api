import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

import { AnswersEnum } from '../../../common/enums';

export class SubmitAnswerDto {
  @IsNotEmpty()
  @IsMongoId()
  question: string;

  @IsNotEmpty()
  @IsEnum(AnswersEnum)
  selectedAnswer: AnswersEnum;
}
