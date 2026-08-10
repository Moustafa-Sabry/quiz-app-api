import { ConflictException } from '@nestjs/common';
import { QuizModel } from '../../common/interfaces/quiz.interface';

export async function checkQuizTitleExists(
  quizModel: QuizModel,
  title: string,
): Promise<void> {
  const existingQuiz = await quizModel.findOne({
    title,
    isDeleted: false,
  });

  if (existingQuiz) {
    throw new ConflictException('Quiz already exists');
  }
}
