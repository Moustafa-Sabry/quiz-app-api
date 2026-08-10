import { Question } from '../../schemas';
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
import { QuestionType, AnswersEnum } from '../../common/enums';
@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}
  async create(createQuestionDto: CreateQuestionDto, creatorId: string) {
    const existingQuestion = await this.questionModel.findOne({
      title: createQuestionDto.title,
      isDeleted: false,
    });

    if (existingQuestion) {
      throw new ConflictException('Question already exists');
    }

    const { questionType, answers, correctAnswer } = createQuestionDto;

    const expectedAnswerCount = questionType === QuestionType.MCQ ? 4 : 2;

    if (answers.length !== expectedAnswerCount) {
      throw new BadRequestException(
        `${questionType} questions must have exactly ${expectedAnswerCount} answers`,
      );
    }

    const keys = answers.map((answer) => answer.key);

    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException('Answer keys must be unique');
    }

    if (questionType === QuestionType.MCQ) {
      const requiredKeys = [
        AnswersEnum.A,
        AnswersEnum.B,
        AnswersEnum.C,
        AnswersEnum.D,
      ];

      const hasAllKeys = requiredKeys.every((key) => keys.includes(key));

      if (!hasAllKeys) {
        throw new BadRequestException(
          'MCQ questions must have A, B, C, and D answers',
        );
      }
    }

    if (questionType === QuestionType.TRUE_FALSE) {
      const hasTrue = keys.includes(AnswersEnum.TRUE);
      const hasFalse = keys.includes(AnswersEnum.FALSE);

      if (!hasTrue || !hasFalse) {
        throw new BadRequestException(
          'True/False questions must have TRUE and FALSE answers',
        );
      }
    }

    if (!keys.includes(correctAnswer)) {
      throw new BadRequestException(
        'Correct answer must match one of the provided answers',
      );
    }

    const question = new this.questionModel({
      ...createQuestionDto,
      creator: creatorId,
    });

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

    const questionType =
      updateQuestionDto.questionType ?? question.questionType;

    const answers = updateQuestionDto.answers ?? question.answers;

    const correctAnswer =
      updateQuestionDto.correctAnswer ?? question.correctAnswer;

    const expectedAnswerCount = questionType === QuestionType.MCQ ? 4 : 2;

    if (answers.length !== expectedAnswerCount) {
      throw new BadRequestException(
        `${questionType} questions must have exactly ${expectedAnswerCount} answers`,
      );
    }

    const keys = answers.map((answer) => answer.key);

    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException('Answer keys must be unique');
    }

    if (questionType === QuestionType.MCQ) {
      const requiredKeys = [
        AnswersEnum.A,
        AnswersEnum.B,
        AnswersEnum.C,
        AnswersEnum.D,
      ];

      const hasAllKeys = requiredKeys.every((key) => keys.includes(key));

      if (!hasAllKeys) {
        throw new BadRequestException(
          'MCQ questions must have A, B, C, and D answers',
        );
      }
    }

    if (questionType === QuestionType.TRUE_FALSE) {
      const hasTrue = keys.includes(AnswersEnum.TRUE);
      const hasFalse = keys.includes(AnswersEnum.FALSE);

      if (!hasTrue || !hasFalse) {
        throw new BadRequestException(
          'True/False questions must have TRUE and FALSE answers',
        );
      }
    }

    if (!keys.includes(correctAnswer)) {
      throw new BadRequestException(
        'Correct answer must match one of the provided answers',
      );
    }

    Object.assign(question, updateQuestionDto);

    return question.save();
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
