import { IsMongoId } from 'class-validator';

export class DeleteQuestionDto {
  @IsMongoId()
  id: string;
}
