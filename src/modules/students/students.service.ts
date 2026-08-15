import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/Group';
import { QuizResult } from 'src/schemas/QuizResult';
import { User } from 'src/schemas/User';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UpdateStudentDto } from './dtos/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,

    @InjectModel(QuizResult.name)
    private readonly quizResultModel: Model<QuizResult>,
  ) {}

  async create(createStudentDto: CreateStudentDto, instructorId: string) {

  if (createStudentDto.email) {
    const exists = await this.userModel.findOne({
      email: createStudentDto.email,
    });

    if (exists) {
      throw new BadRequestException('Email already exists');
    }
  }

  const tempPassword = Math.random().toString(36).slice(-8);

  const email =
    createStudentDto.email ||
    `student${Date.now()}@quiz.com`;

  const student = await this.userModel.create({
    ...createStudentDto,
    email,
    password: tempPassword,
    role: 'Learner',
    instructorId,
    isActive: true,
  });

  const studentObj = student.toObject();
  const { password, ...studentData } = studentObj;

  return {
    message: 'Student added successfully',
    temporaryPassword: tempPassword,
    student: studentData,
  };
  }

  async findAll(
  instructorId: string,
  page = 1,
  limit = 10,
  groupId?: string,
  search?: string,
) {
  const skip = (page - 1) * limit;

  const filter: any = {
    role: 'Learner',
    instructorId,
  };

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }

  if (groupId) {
    const group = await this.groupModel.findById(groupId);

    if (!group) {
      throw new BadRequestException('Group not found');
    }

    filter._id = { $in: group.learners };
  }

  const total = await this.userModel.countDocuments(filter);

  const students = await this.userModel
    .find(filter)
    .skip(skip)
    .limit(limit);

  const data: any[] = [];

  for (const student of students) {
    const results = await this.quizResultModel.find({
      learnerId: student._id,
    });

    const totalQuizzesTaken = results.length;

    const averageScore =
      totalQuizzesTaken === 0
        ? 0
        : results.reduce((sum, r) => sum + r.scorePercentage, 0) /
          totalQuizzesTaken;

    data.push({
      id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      averageScore,
      totalQuizzesTaken,
    });
  }

  data.sort((a, b) => b.averageScore - a.averageScore);

  data.forEach((student, index) => {
    student.classRank = index + 1;
  });

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

   async update(
  studentId: string,
  dto: UpdateStudentDto,
  instructorId: string,
) {

  const student = await this.userModel.findById(studentId);

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  if (student.role !== 'Learner') {
    throw new BadRequestException('User is not a learner');
  }

  if (student.instructorId?.toString() !== instructorId) {
    throw new ForbiddenException('Unauthorized');
  }

  Object.assign(student, dto);

  await student.save();

  const results = await this.quizResultModel.find({
    learnerId: student._id,
  });

  const totalQuizzesTaken = results.length;

  const averageScore =
    totalQuizzesTaken === 0
      ? 0
      : results.reduce(
          (sum, item) => sum + item.scorePercentage,
          0,
        ) / totalQuizzesTaken;

  return {
    id: student._id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone,
    averageScore,
    totalQuizzesTaken,
  };
}

async delete(
  studentId: string,
  instructorId: string,
) {
  const student = await this.userModel.findById(studentId);

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  if (student.role !== 'Learner') {
    throw new BadRequestException('User is not a learner');
  }

  if (student.instructorId.toString() !== instructorId) {
    throw new ForbiddenException('Unauthorized');
  }

  await this.groupModel.updateMany(
    {
      learners: student._id,
    },
    {
      $pull: {
        learners: student._id,
      },
    },
  );

  await this.userModel.findByIdAndDelete(studentId);

  return {
    message: 'Student deleted successfully',
  };
}
}