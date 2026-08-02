import { IsMongoId } from 'class-validator';

export class DeleteQuizDto {
  @IsMongoId()
  id: string;
}
