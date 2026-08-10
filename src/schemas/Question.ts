import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './Answer';
import {
  difficultyLevelenum,
  CategoryType,
  AnswersEnum,
  QuestionType,
} from 'src/common/enums';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Question {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
    trim: true,
  })
  creator: Types.ObjectId;
  @Prop({
    required: true,
    type: String,
    minlength: 10,
    maxlength: 500,
  })
  title: string;
  @Prop({
    type: String,
    maxlength: 1000,
  })
  description: string;
  @Prop({
    required: true,
    type: [AnswerSchema],
  })
  answers: Answer[];
  @Prop({
    required: true,
    enum: AnswersEnum,
  })
  correctAnswer: AnswersEnum;
  @Prop({
    required: true,
    enum: QuestionType,
  })
  questionType: QuestionType;
  @Prop({
    required: true,
    enum: CategoryType,
  })
  category: CategoryType;
  @Prop({
    required: true,
    enum: difficultyLevelenum,
  })
  difficultyLevel: difficultyLevelenum;
  @Prop({
    default: false,
  })
  isDeleted: boolean;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.index({
  category: 1,
  isDeleted: 1,
});
