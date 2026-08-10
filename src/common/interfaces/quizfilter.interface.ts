import { difficultyLevelenum, CategoryType } from '../enums';

export interface QuizFilter {
  isDeleted: boolean;
  category?: CategoryType;
  difficultyLevel?: difficultyLevelenum;
  scheduledDate?: {
    $gte?: Date;
    $lt?: Date;
  };
}
