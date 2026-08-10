import { Module } from '@nestjs/common';
import { QuestionController } from './questions.controller';
import { QuestionService } from './questions.service';
import { Question, QuestionSchema } from '../../schemas';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Question.name,
        schema: QuestionSchema,
      },
    ]),
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionsModule {}
