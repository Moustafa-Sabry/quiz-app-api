import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { Question, Quiz, QuizAttempt } from '../../schemas';
import { Duration } from '../../common/enums';
import { JoinQuizDto } from './dtos/join-quiz.dto';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';

type QuestionDocument = HydratedDocument<Question>;
type QuizDocument = HydratedDocument<Quiz>;
type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

type PopulatedQuestion = QuestionDocument & {
  _id: Types.ObjectId;
};

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  async joinQuiz(joinQuizDto: JoinQuizDto, studentId: string) {
    const quiz = await this.quizModel
      .findOne({
        accessCode: joinQuizDto.accessCode,
        isDeleted: false,
      })
      .populate('questions');

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    const attemptsCount = await this.quizAttemptModel.countDocuments({
      quiz: quiz._id,
      student: studentId,
    });

    if (attemptsCount >= quiz.maxAttempts) {
      throw new BadRequestException(
        'You have reached the maximum number of attempts for this quiz',
      );
    }

    const activeAttempt = await this.quizAttemptModel.findOne({
      quiz: quiz._id,
      student: studentId,
      finishedAt: null,
    });

    if (activeAttempt) {
      throw new BadRequestException(
        'You already have an active attempt for this quiz',
      );
    }

    const attempt = await this.quizAttemptModel.create({
      quiz: quiz._id,
      student: studentId,
      startedAt: new Date(),
      answers: [],
      correctAnswers: 0,
    });

    return {
      message: 'Quiz joined successfully',
      data: {
        attemptId: attempt._id,
        quizId: quiz._id,
        startedAt: attempt.startedAt,
        duration: quiz.duration,
        numberOfQuestions: quiz.numberOfQuestions,
        maxAttempts: quiz.maxAttempts,
        attemptNumber: attemptsCount + 1,
      },
    };
  }

  async getAttempt(attemptId: string, studentId: string) {
    const attempt = await this.quizAttemptModel
      .findOne({
        _id: attemptId,
        student: studentId,
      })
      .populate({
        path: 'quiz',
        populate: {
          path: 'questions',
        },
      });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.finishedAt) {
      throw new BadRequestException(
        'This quiz attempt has already been submitted',
      );
    }

    const quiz = attempt.quiz as unknown as QuizDocument;

    const durationInMilliseconds = this.convertDurationToMilliseconds(
      quiz.duration,
    );

    const deadline = attempt.startedAt.getTime() + durationInMilliseconds;

    const now = Date.now();

    if (now >= deadline) {
      attempt.finishedAt = new Date();
      await attempt.save();

      throw new BadRequestException('Quiz time has expired');
    }

    const remainingTime = deadline - now;

    const quizQuestions = quiz.questions as unknown as PopulatedQuestion[];

    let questions = [...quizQuestions];

    if (quiz.randomize) {
      questions = this.shuffleArray(questions);
    }

    const safeQuestions = questions.map((question) => ({
      _id: question._id,
      title: question.title,
      description: question.description,
      answers: question.answers,
      questionType: question.questionType,
      category: question.category,
      difficultyLevel: question.difficultyLevel,
    }));

    return {
      message: 'Quiz retrieved successfully',
      data: {
        attemptId: attempt._id,
        quizId: quiz._id,
        startedAt: attempt.startedAt,
        deadline: new Date(deadline),
        remainingTime,
        duration: quiz.duration,
        numberOfQuestions: quiz.numberOfQuestions,
        questions: safeQuestions,
      },
    };
  }

  async submitQuiz(
    attemptId: string,
    studentId: string,
    submitQuizDto: SubmitQuizDto,
  ) {
    const attempt = await this.quizAttemptModel.findOne({
      _id: attemptId,
      student: studentId,
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.finishedAt) {
      throw new BadRequestException('Quiz attempt has already been submitted');
    }

    const quiz = await this.quizModel
      .findOne({
        _id: attempt.quiz,
        isDeleted: false,
      })
      .populate('questions');

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const quizQuestions = quiz.questions as unknown as PopulatedQuestion[];

    const durationInMilliseconds = this.convertDurationToMilliseconds(
      quiz.duration,
    );

    const deadline = attempt.startedAt.getTime() + durationInMilliseconds;

    if (Date.now() >= deadline) {
      attempt.finishedAt = new Date();
      await attempt.save();

      throw new BadRequestException('Quiz time has expired');
    }

    const quizQuestionIds = new Set(
      quizQuestions.map((question) => question._id.toString()),
    );

    for (const answer of submitQuizDto.answers) {
      if (!quizQuestionIds.has(answer.question)) {
        throw new BadRequestException(
          `Question ${answer.question} does not belong to this quiz`,
        );
      }
    }

    const submittedQuestionIds = submitQuizDto.answers.map(
      (answer) => answer.question,
    );

    if (new Set(submittedQuestionIds).size !== submittedQuestionIds.length) {
      throw new BadRequestException(
        'A question cannot be answered more than once',
      );
    }

    let correctAnswers = 0;

    for (const submittedAnswer of submitQuizDto.answers) {
      const question = quizQuestions.find(
        (quizQuestion) =>
          quizQuestion._id.toString() === submittedAnswer.question,
      );

      if (!question) {
        continue;
      }

      if (question.correctAnswer === submittedAnswer.selectedAnswer) {
        correctAnswers++;
      }
    }

    attempt.answers = submitQuizDto.answers.map((answer) => ({
      question: new Types.ObjectId(answer.question),
      selectedAnswer: answer.selectedAnswer,
    }));

    attempt.correctAnswers = correctAnswers;
    attempt.finishedAt = new Date();

    await attempt.save();

    const score = correctAnswers * quiz.scorePerQuestion;

    return {
      message: 'Quiz submitted successfully',
      data: {
        attemptId: attempt._id,
        correctAnswers,
        totalQuestions: quiz.numberOfQuestions,
        score,
        scorePerQuestion: quiz.scorePerQuestion,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
      },
    };
  }

  private convertDurationToMilliseconds(duration: Duration): number {
    return duration * 60 * 1000;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }
}
