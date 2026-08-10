import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { Quiz, QuizAttempt } from '../../schemas';

type QuizDocument = HydratedDocument<Quiz>;
type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  async getLearnerDashboard(studentId: string) {
    const attempts = await this.quizAttemptModel.find({
      student: studentId,
    });

    const completedAttempts = attempts.filter(
      (attempt) => attempt.finishedAt !== null,
    );

    const activeAttempts = attempts.filter((attempt) => !attempt.finishedAt);
    const totalAttempts = attempts.length;
    const completedQuizIds = new Set(
      completedAttempts.map((attempt) => attempt.quiz.toString()),
    );

    const activeQuizIds = new Set(
      activeAttempts.map((attempt) => attempt.quiz.toString()),
    );

    const completedQuizzes = completedQuizIds.size;
    const inProgressQuizzes = activeQuizIds.size;

    const quizIds = [...completedQuizIds].map((id) => new Types.ObjectId(id));

    const quizzes = await this.quizModel.find({
      _id: { $in: quizIds },
      isDeleted: false,
    });

    const quizMap = new Map(quizzes.map((quiz) => [quiz._id.toString(), quiz]));

    let totalScore = 0;
    let scoredAttempts = 0;

    for (const attempt of completedAttempts) {
      const quiz = quizMap.get(attempt.quiz.toString());

      if (!quiz) {
        continue;
      }

      const score = attempt.correctAnswers * quiz.scorePerQuestion;

      totalScore += score;
      scoredAttempts++;
    }

    const averageScore =
      scoredAttempts > 0 ? Number((totalScore / scoredAttempts).toFixed(2)) : 0;

    return {
      message: 'Learner dashboard retrieved successfully',
      data: {
        totalAttempts,
        completedQuizzes,
        inProgressQuizzes,
        averageScore,
      },
    };
  }
}
