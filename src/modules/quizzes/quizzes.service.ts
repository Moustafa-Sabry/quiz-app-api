import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuizFilter } from '../../common/interfaces/quizfilter.interface';
import { Quiz } from '../../schemas/Quiz';
import { CreateQuizDto } from './dtos/CreateQuiz.dto';
import { UpdateQuizDto } from './dtos/UpdateQuiz.dto';
import { GetQuizzesDto } from './dtos/GetAllQuizs.dto';
import { QuizStatus } from '../../common/enums/quizStatus.enum';
import { Question } from '../../schemas/Question';
@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}
  //  check and validate the existance of the group , creator
  async create(createQuizDto: CreateQuizDto) {
    const existingQuiz = await this.quizModel.findOne({
      title: createQuizDto.title,
      isDeleted: false,
    });

    if (existingQuiz) {
      throw new ConflictException('Quiz already exists');
    }

    if (createQuizDto.questions.length !== createQuizDto.numberOfQuestions) {
      throw new BadRequestException(
        'Number of questions must match the provided questions',
      );
    }

    if (
      new Set(createQuizDto.questions).size !== createQuizDto.questions.length
    ) {
      throw new BadRequestException('Questions must not contain duplicates');
    }

    const existingQuestions = await this.questionModel.find({
      _id: { $in: createQuizDto.questions },
      isDeleted: false,
    });

    if (existingQuestions.length !== createQuizDto.questions.length) {
      throw new NotFoundException(
        'One or more questions do not exist or have been deleted',
      );
    }

    const quiz = new this.quizModel({
      ...createQuizDto,
      scheduledDate: new Date(createQuizDto.scheduledDate),
    });

    return quiz.save();
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

    return quiz.save();
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
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingQuiz) {
        throw new ConflictException('Quiz already exists');
      }
    }

    if (updateQuizDto.questions) {
      if (updateQuizDto.questions.length !== quiz.numberOfQuestions) {
        throw new BadRequestException(
          'Number of questions must match the quiz numberOfQuestions',
        );
      }
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

    return updatedQuiz;
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

    return this.quizModel.find(filter);
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

    return quiz;
  }
}
