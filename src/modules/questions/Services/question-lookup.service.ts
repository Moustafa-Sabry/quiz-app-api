import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Question } from '../../../schemas';

@Injectable()
export class QuestionLookupService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  async findActive(id: string): Promise<Question> {
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
