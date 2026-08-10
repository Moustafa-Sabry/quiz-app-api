import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../schemas';

@Injectable()
export class QuizCreatorService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async validate(createdBy: string): Promise<User> {
    const creator = await this.userModel.findOne({
      _id: createdBy,
      role: 'Instructor',
    });

    if (!creator) {
      throw new NotFoundException(
        'Creator not found or user is not an Instructor',
      );
    }

    return creator;
  }
}
