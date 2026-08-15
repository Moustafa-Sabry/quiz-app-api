import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Group } from 'src/schemas/Group';
import { Question } from 'src/schemas/Question';
import { Quiz } from 'src/schemas/Quiz';
import { QuizResult } from 'src/schemas/QuizResult';


@Injectable()
export class QuizResultService {
  constructor(
    @InjectModel(QuizResult.name)
    private readonly quizResultModel: Model<QuizResult>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>,

    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,

    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  async findAll(
  userId: string,
  role: string,
  page = 1,
  limit = 10,
  quizId?: string,
  groupId?: string,
) {
  const skip = (page - 1) * limit;

  // ================= Instructor =================
  if (role === 'Instructor') {

    const quizzes = await this.quizModel.find({
      instructorId: userId,
    });

    const quizIds = quizzes.map((quiz) => quiz._id);

    const filter: any = {
      quizId: { $in: quizIds },
    };

    if (quizId) {
      filter.quizId = quizId;
    }

    if (groupId) {
      filter.groupId = groupId;
    }

    const total = await this.quizResultModel.countDocuments(filter);

    const results = await this.quizResultModel
      .find(filter)
      .populate('quizId', 'title totalEnrolledStudents')
      .populate('groupId', 'groupName learnerCount')
      .populate('learnerId', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const data = results.map((result: any) => ({
  id: result._id,
  quizTitle: result.quizId.title,
  groupName: result.groupId.groupName,
  numberOfPersons: result.groupId.learnerCount,
  participants: 1,
  submittedAt: result.submittedAt,
}));

return {
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
};
  }

  // ================= Learner =================

  if (role === 'Learner') {

    const total = await this.quizResultModel.countDocuments({
      learnerId: userId,
    });

    const results = await this.quizResultModel
      .find({
        learnerId: userId,
      })
      .populate('quizId', 'title scorePerQuestion numberOfQuestions')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const data = results.map((result: any) => ({
  id: result._id,
  quizTitle: result.quizId.title,
  score: `${result.totalScore} / ${
    result.quizId.scorePerQuestion * result.quizId.numberOfQuestions
  }`,
  percentage: result.scorePercentage,
  submittedAt: result.submittedAt,
}));

return {
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
};
  }

  throw new ForbiddenException('Invalid role');
}

async getQuizSummary(
  quizId: string,
  instructorId: string,
) {
  const quiz = await this.quizModel.findById(quizId);

  if (!quiz) {
    throw new NotFoundException('Quiz not found');
  }

  if (quiz.createdBy.toString() !== instructorId) {
    throw new ForbiddenException(
      'You are not authorized to view this quiz',
    );
  }

  const results = await this.quizResultModel
    .find({
      quizId,
    })
    .populate('learnerId', 'firstName lastName')
    .sort({
      totalScore: -1,
    });

  const totalParticipated = results.length;

  const averageScore =
    totalParticipated > 0
      ? results.reduce(
          (sum: number, item: any) => sum + item.totalScore,
          0,
        ) / totalParticipated
      : 0;

  const highestScore =
    totalParticipated > 0
      ? Math.max(...results.map((item: any) => item.totalScore))
      : 0;

  const lowestScore =
    totalParticipated > 0
      ? Math.min(...results.map((item: any) => item.totalScore))
      : 0;

  const students = results.map((item: any) => ({
    learnerId: item.learnerId._id,
    studentName: `${item.learnerId.firstName} ${item.learnerId.lastName}`,
    score: item.totalScore,
    percentage: item.scorePercentage,
    timeTaken: item.timeTaken,
    submittedAt: item.submittedAt,
  }));

  return {
    quizId: quiz._id,
    quizTitle: quiz.title,
    scheduledDateTime: quiz.scheduledDate,
    totalEnrolled: quiz.totalEnrolledStudents,
    totalParticipated,
    averageScore,
    highestScore,
    lowestScore,
    results: students,
  };
}

async findOne(
  resultId: string,
  userId: string,
  role: string,
) {
  const result = await this.quizResultModel
    .findById(resultId)
    .populate('learnerId', 'firstName lastName email')
    .populate('quizId', 'title scheduledDateTime');

  if (!result) {
    throw new NotFoundException('Result not found');
  }

  // Instructor
  if (role === 'Instructor') {
    const quiz: any = await this.quizModel.findById(result.quizId);

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.instructorId.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view this result',
      );
    }
  }

  // Learner
  if (role === 'Learner') {
    if (result.learnerId._id.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view this result',
      );
    }
  }

  const answers : Array<any> = [];

  for (let i = 0; i < result.answers.length; i++) {
    const answer: any = result.answers[i];

    const question = await this.questionModel.findById(
      answer.questionId,
    );

    answers.push({
      questionNumber: i + 1,
      questionTitle: question?.title,
      selectedOption: answer.selectedOption,
      correctOption: answer.correctOption,
      isCorrect: answer.isCorrect,
      indicator: answer.isCorrect ? '✓' : '✗',
    });
  }

  return {
    resultId: result._id,
    quizTitle: (result.quizId as any).title,
    learner: result.learnerId,
    totalScore: result.totalScore,
    percentage: result.scorePercentage,
    submittedAt: result.submittedAt,
    answers,
  };
}
}