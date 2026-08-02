import { IsMongoId } from 'class-validator';

export class GetQuizDto {
  @IsMongoId()
  id: string;
}
