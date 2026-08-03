import { IsMongoId } from 'class-validator';

export class GetQuestionDto {
  @IsMongoId()
  id: string;
}
