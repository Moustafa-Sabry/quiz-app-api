import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Quiz } from '../../schemas';
import { CreateQuizDto } from './dtos/CreateQuiz.dto';
import { UpdateQuizDto } from './dtos/UpdateQuiz.dto';
import { GetQuizzesDto } from './dtos/GetAllQuizs.dto';

import { QuizFilter } from '../../common/interfaces/quizfilter.interface';
import { QuizStatus } from '../../common/enums';

import { QuizCreatorService } from './Services/quiz-creator.service';
import { QuizGroupService } from './Services/quiz-group.service';
import { QuizQuestionService } from './Services/quiz-question.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>,

    private readonly quizCreatorService: QuizCreatorService,

    private readonly quizQuestionService: QuizQuestionService,

    private readonly quizGroupService: QuizGroupService,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    const existingQuiz = await this.quizModel.findOne({
      title: createQuizDto.title,
      createdBy: createQuizDto.createdBy,
      isDeleted: false,
    });

    if (existingQuiz) {
      throw new ConflictException('You already have a quiz with this title');
    }

    await this.quizCreatorService.validate(createQuizDto.createdBy);

    await this.quizQuestionService.validate(
      createQuizDto.questions,
      createQuizDto.numberOfQuestions,
    );

    await this.quizGroupService.validate(
      createQuizDto.assignedToGroups,
      createQuizDto.createdBy,
    );

    const quiz = new this.quizModel({
      ...createQuizDto,
      scheduledDate: new Date(createQuizDto.scheduledDate),
    });

    const savedQuiz = await quiz.save();

    return {
      message: 'Quiz created successfully',
      data: savedQuiz,
      accessCode: savedQuiz.accessCode,
    };
  }

  async remove(id: string) {
    const quiz = await this.quizModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    quiz.isDeleted = true;

    await quiz.save();

    return {
      message: 'Quiz deleted successfully',
    };
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.quizModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (updateQuizDto.title) {
      const existingQuiz = await this.quizModel.findOne({
        title: updateQuizDto.title,
        createdBy: quiz.createdBy,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingQuiz) {
        throw new ConflictException('You already have a quiz with this title');
      }
    }

    if (updateQuizDto.questions) {
      await this.quizQuestionService.validate(
        updateQuizDto.questions,
        quiz.numberOfQuestions,
      );
    }

    if (updateQuizDto.assignedToGroups) {
      await this.quizGroupService.validate(
        updateQuizDto.assignedToGroups,
        quiz.createdBy.toString(),
      );
    }

    const updatedQuiz = await this.quizModel.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        $set: {
          ...updateQuizDto,

          ...(updateQuizDto.scheduledDate && {
            scheduledDate: new Date(updateQuizDto.scheduledDate),
          }),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedQuiz) {
      throw new NotFoundException('Quiz not found');
    }

    return {
      message: 'Quiz updated successfully',
      data: updatedQuiz,
      accessCode: updatedQuiz.accessCode,
    };
  }

  async findAll(getQuizzesDto: GetQuizzesDto) {
    const filter: QuizFilter = {
      isDeleted: false,
    };

    if (getQuizzesDto.category) {
      filter.category = getQuizzesDto.category;
    }

    if (getQuizzesDto.difficultyLevel) {
      filter.difficultyLevel = getQuizzesDto.difficultyLevel;
    }

    const now = new Date();

    if (getQuizzesDto.status === QuizStatus.UPCOMING) {
      filter.scheduledDate = {
        $gte: now,
      };
    }

    if (getQuizzesDto.status === QuizStatus.COMPLETED) {
      filter.scheduledDate = {
        $lt: now,
      };
    }

    const quizzes = await this.quizModel.find(filter);

    return {
      message: 'Quizzes retrieved successfully',
      data: quizzes,
    };
  }

  async findOne(id: string) {
    const quiz = await this.quizModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .populate('questions')
      .populate('assignedToGroups');

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return {
      message: 'Quiz retrieved successfully',
      data: quiz,
    };
  }
}
