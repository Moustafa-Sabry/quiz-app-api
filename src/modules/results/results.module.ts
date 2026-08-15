import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from 'src/schemas/Group';
import { Question, QuestionSchema } from 'src/schemas/Question';
import { Quiz, QuizSchema } from 'src/schemas/Quiz';
import { QuizResult, QuizResultSchema } from 'src/schemas/QuizResult';
import { QuizResultController } from './results.controller';
import { QuizResultService } from './results.service';



@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuizResult.name,
        schema: QuizResultSchema,
      },
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
      {
        name: Group.name,
        schema: GroupSchema,
      },
      {
       name: Question.name,
       schema: QuestionSchema,
      }
    ]),
  ],
  controllers: [QuizResultController],
  providers: [QuizResultService],
})
export class ResultsModule {}
