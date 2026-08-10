import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Question } from '../../../schemas';

@Injectable()
export class QuestionTitleService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  async checkCreate(title: string): Promise<void> {
    const existingQuestion = await this.questionModel.findOne({
      title,
      isDeleted: false,
    });

    if (existingQuestion) {
      throw new ConflictException('Question already exists');
    }
  }

  async checkUpdate(title: string, questionId: string): Promise<void> {
    const existingQuestion = await this.questionModel.findOne({
      title,
      isDeleted: false,
      _id: { $ne: questionId },
    });

    if (existingQuestion) {
      throw new ConflictException('Question already exists');
    }
  }
}
