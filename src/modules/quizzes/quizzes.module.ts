import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';

import {
  Quiz,
  QuizSchema,
  Question,
  QuestionSchema,
  Group,
  GroupSchema,
  User,
  UserSchema,
} from '../../schemas';

import { QuizCreatorService } from './Services/quiz-creator.service';
import { QuizQuestionService } from './Services/quiz-question.service';
import { QuizGroupService } from './Services/quiz-group.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],

  controllers: [QuizzesController],

  providers: [
    QuizzesService,
    QuizCreatorService,
    QuizQuestionService,
    QuizGroupService,
  ],

  exports: [QuizzesService],
})
export class QuizzesModule {}
