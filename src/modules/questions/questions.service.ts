import { Question } from '../../schemas/Question';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuestionDto } from './dtos/createQuestion.dto';
import { UpdateQuestionDto } from './dtos/updateQuestion.dto';
@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}
  async create(createQuestionDto: CreateQuestionDto) {
    const existingQuestion = await this.questionModel.findOne({
      title: createQuestionDto.title,
      isDeleted: false,
    });

    if (existingQuestion) {
      throw new ConflictException('Question already exists');
    }
    const correctAnswerExists = createQuestionDto.answers.some(
      (answer) => answer.key === createQuestionDto.correctAnswer,
    );

    if (!correctAnswerExists) {
      throw new BadRequestException(
        'Correct answer must match one of the provided answers',
      );
    }
    const keys = createQuestionDto.answers.map((answer) => answer.key);

    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException('Answer keys must be unique');
    }
    const question = new this.questionModel(createQuestionDto);

    const savedQuestion = await question.save();

    return {
      message: 'Question created successfully',
      data: savedQuestion,
    };
  }
  async findAll() {
    const questions = await this.questionModel.find({
      isDeleted: false,
    });

    return {
      message: 'Questions retrieved successfully',
      data: questions,
    };
  }
  async remove(id: string) {
    const question = await this.findActiveQuestion(id);

    question.isDeleted = true;

    await question.save();

    return {
      message: 'Question deleted successfully',
    };
  }
  async findOne(id: string) {
    const question = await this.findActiveQuestion(id);

    return {
      message: 'Question retrieved successfully',
      data: question,
    };
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.findActiveQuestion(id);

    if (updateQuestionDto.title) {
      const existingQuestion = await this.questionModel.findOne({
        title: updateQuestionDto.title,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingQuestion) {
        throw new ConflictException('Question already exists');
      }
    }

    if (updateQuestionDto.answers && updateQuestionDto.correctAnswer) {
      const correctAnswerExists = updateQuestionDto.answers.some(
        (answer) => answer.key === updateQuestionDto.correctAnswer,
      );

      if (!correctAnswerExists) {
        throw new BadRequestException(
          'Correct answer must match one of the provided answers',
        );
      }
    }

    if (updateQuestionDto.answers) {
      const keys = updateQuestionDto.answers.map((answer) => answer.key);

      if (new Set(keys).size !== keys.length) {
        throw new BadRequestException('Answer keys must be unique');
      }
    }

    Object.assign(question, updateQuestionDto);

    const updatedQuestion = await question.save();

    return {
      message: 'Question updated successfully',
      data: updatedQuestion,
    };
  }

  private async findActiveQuestion(id: string) {
    const question = await this.questionModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }
}
