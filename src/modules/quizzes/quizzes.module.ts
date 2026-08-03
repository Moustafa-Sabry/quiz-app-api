import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from '../../schemas/Quiz';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Question, QuestionSchema } from '../../schemas/Question';
import { Group, GroupSchema } from '../../schemas/Group';
import { User, UserSchema } from '../../schemas/User';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
      {
        name: Question.name,
        schema: QuestionSchema,
      },
      {
        name: Group.name,
        schema: GroupSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
