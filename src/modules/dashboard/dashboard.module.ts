import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from 'src/schemas/User';
import { Group, GroupSchema } from 'src/schemas/Group';
import { Quiz, QuizSchema } from 'src/schemas/Quiz';
import { QuizResult, QuizResultSchema } from 'src/schemas/QuizResult';


@Module({

  imports: [
    MongooseModule.forFeature([

      {
        name: User.name,
        schema: UserSchema,
      },

      {
        name: Group.name,
        schema: GroupSchema,
      },

      {
        name: Quiz.name,
        schema: QuizSchema,
      },

      {
        name: QuizResult.name,
        schema: QuizResultSchema,
      },

    ]),
  ],

  controllers: [
    DashboardController,
  ],

  providers: [
    DashboardService,
  ],

  exports: [
    DashboardService,
  ],

})
export class DashboardModule {}