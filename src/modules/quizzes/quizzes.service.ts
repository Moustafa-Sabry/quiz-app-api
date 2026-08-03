import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizFilter } from '../../common/interfaces/quizfilter.interface';
import { Quiz } from '../../schemas/Quiz';
import { CreateQuizDto } from './dtos/CreateQuiz.dto';
import { UpdateQuizDto } from './dtos/UpdateQuiz.dto';
import { GetQuizzesDto } from './dtos/GetAllQuizs.dto';
import { QuizStatus } from '../../common/enums/quizStatus.enum';
import { Question } from '../../schemas/Question';
import { Group, GroupDocument } from '../../schemas/Group';
import { User, UserDocument } from '../../schemas/User';
@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    const existingQuiz = await this.quizModel.findOne({
      title: createQuizDto.title,
      isDeleted: false,
    });

    if (existingQuiz) {
      throw new ConflictException('Quiz already exists');
    }

    const creator = await this.userModel.findOne({
      _id: createQuizDto.createdBy,
      role: 'Instructor',
    });

    if (!creator) {
      throw new NotFoundException(
        'Creator not found or user is not an Instructor',
      );
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

    const groups = await this.groupModel.find({
      _id: { $in: createQuizDto.assignedToGroups },
    });

    if (groups.length !== createQuizDto.assignedToGroups.length) {
      throw new NotFoundException('One or more assigned groups do not exist');
    }

    const unauthorizedGroup = groups.find(
      (group) => group.instructorId.toString() !== createQuizDto.createdBy,
    );

    if (unauthorizedGroup) {
      throw new ForbiddenException(
        'You can only assign groups that belong to the quiz creator',
      );
    }

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

      if (
        new Set(updateQuizDto.questions).size !== updateQuizDto.questions.length
      ) {
        throw new BadRequestException('Questions must not contain duplicates');
      }

      const existingQuestions = await this.questionModel.find({
        _id: { $in: updateQuizDto.questions },
        isDeleted: false,
      });

      if (existingQuestions.length !== updateQuizDto.questions.length) {
        throw new NotFoundException(
          'One or more questions do not exist or have been deleted',
        );
      }
    }

    if (updateQuizDto.assignedToGroups) {
      const groups = await this.groupModel.find({
        _id: { $in: updateQuizDto.assignedToGroups },
      });

      if (groups.length !== updateQuizDto.assignedToGroups.length) {
        throw new NotFoundException('One or more assigned groups do not exist');
      }

      const unauthorizedGroup = groups.find(
        (group) => group.instructorId.toString() !== quiz.createdBy.toString(),
      );

      if (unauthorizedGroup) {
        throw new ForbiddenException(
          'You can only assign groups that belong to the quiz creator',
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
