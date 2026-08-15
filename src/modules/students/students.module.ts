import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from 'src/schemas/Group';
import { QuizResult, QuizResultSchema } from 'src/schemas/QuizResult';
import { User, UserSchema } from 'src/schemas/User';
import { StudentController } from './students.controller';
import { StudentService } from './students.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: QuizResult.name, schema: QuizResultSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentsModule {}
