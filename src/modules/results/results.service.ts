import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { Quiz, QuizAttempt } from '../../schemas';

type QuizDocument = HydratedDocument<Quiz>;
type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  async findAll(studentId: string) {
    const results = await this.quizAttemptModel
      .find({
        student: studentId,
        finishedAt: { $ne: null },
      })
      .populate({
        path: 'quiz',
        select:
          'title numberOfQuestions scorePerQuestion category difficultyLevel',
      })
      .sort({
        finishedAt: -1,
      });

    const data = results.map((attempt) => {
      const quiz = attempt.quiz as unknown as QuizDocument;

      const score = attempt.correctAnswers * quiz.scorePerQuestion;

      return {
        attemptId: attempt._id,

        quiz: {
          id: quiz._id,
          title: quiz.title,
          category: quiz.category,
          difficultyLevel: quiz.difficultyLevel,
        },

        correctAnswers: attempt.correctAnswers,

        totalQuestions: quiz.numberOfQuestions,

        score,

        scorePerQuestion: quiz.scorePerQuestion,

        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
      };
    });

    return {
      message: 'Results retrieved successfully',
      data,
    };
  }

  async findOne(attemptId: string, studentId: string) {

    if (!Types.ObjectId.isValid(attemptId)) {
      throw new BadRequestException('Invalid attempt ID');
    }

    const attempt = await this.quizAttemptModel
      .findOne({
        _id: attemptId,
student: studentId,

        finishedAt: { $ne: null },
      })
      .populate({
        path: 'quiz',
        select:
          'title description duration numberOfQuestions scorePerQuestion category difficultyLevel',
      })
      .populate({
        path: 'answers.question',
        select: 'title answers questionType category difficultyLevel',
      });

    if (!attempt) {
      throw new NotFoundException('Result not found');
    }

    const quiz = attempt.quiz as unknown as QuizDocument;

    const score = attempt.correctAnswers * quiz.scorePerQuestion;

    return {
      message: 'Result retrieved successfully',

      data: {
        attemptId: attempt._id,

        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          duration: quiz.duration,
          numberOfQuestions: quiz.numberOfQuestions,
          scorePerQuestion: quiz.scorePerQuestion,
          category: quiz.category,
          difficultyLevel: quiz.difficultyLevel,
        },

        result: {
          correctAnswers: attempt.correctAnswers,

          totalQuestions: quiz.numberOfQuestions,

          score,

          scorePerQuestion: quiz.scorePerQuestion,
        },

        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,

        answers: attempt.answers,
      },
    };
  }
}
