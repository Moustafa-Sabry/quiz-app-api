import { difficultyLevelenum } from '../enums/difficultyLevel.enum';

export interface QuizFilter {
  isDeleted: boolean;
  category?: string;
  difficultyLevel?: difficultyLevelenum;
  scheduledDate?: {
    $gte?: Date;
    $lt?: Date;
  };
}
