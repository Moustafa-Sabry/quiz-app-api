import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Answer } from './Answer';
import { AnswersEnum } from '../common/enums/Answers.enum';
import { CategoryType } from '../common/enums/categoies.enum';
import { difficultyLevelenum } from '../common/enums/difficultyLevel.enum';

export const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema({
  timestamps: true,
})
export class Question {
  @Prop({
    // required: true,
    type: String,
    trim: true,
  })
  creator: string;
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
    validate: {
      validator: (answers: Answer[]) => answers.length === 4,
      message: 'A question must have exactly 4 answers',
    },
  })
  answers: Answer[];
  @Prop({
    required: true,
    enum: AnswersEnum,
  })
  correctAnswer: AnswersEnum;
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
