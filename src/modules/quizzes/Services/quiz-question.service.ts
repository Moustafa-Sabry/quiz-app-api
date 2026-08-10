import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from '../../../schemas';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  async validate(
    questions: string[],
    numberOfQuestions: number,
  ): Promise<Question[]> {
    if (questions.length !== numberOfQuestions) {
      throw new BadRequestException(
        'Number of questions must match the provided questions',
      );
    }

    if (new Set(questions).size !== questions.length) {
      throw new BadRequestException('Questions must not contain duplicates');
    }

    const existingQuestions = await this.questionModel.find({
      _id: { $in: questions },
      isDeleted: false,
    });

    if (existingQuestions.length !== questions.length) {
      throw new NotFoundException(
        'One or more questions do not exist or have been deleted',
      );
    }

    return existingQuestions;
  }
}
