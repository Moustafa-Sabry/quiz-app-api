import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from '../../../schemas';

@Injectable()
export class QuizGroupService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
  ) {}

  async validate(
    assignedToGroups: string[],
    instructorId: string,
  ): Promise<Group[]> {
    const groups = await this.groupModel.find({
      _id: { $in: assignedToGroups },
    });

    if (groups.length !== assignedToGroups.length) {
      throw new NotFoundException('One or more assigned groups do not exist');
    }

    const unauthorizedGroup = groups.find(
      (group) => group.instructorId.toString() !== instructorId,
    );

    if (unauthorizedGroup) {
      throw new ForbiddenException(
        'You can only assign groups that belong to the quiz creator',
      );
    }

    return groups;
  }
}
