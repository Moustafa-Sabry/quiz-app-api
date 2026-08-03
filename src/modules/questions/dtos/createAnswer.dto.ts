import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AnswersEnum } from '../../../common/enums/Answers.enum';
export class CreateAnswerDto {
  @IsNotEmpty()
  @IsEnum(AnswersEnum)
  key: AnswersEnum;

  @IsNotEmpty()
  @IsString()
  text: string;
}
