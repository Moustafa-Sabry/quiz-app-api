import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AttemptAnswer, AttemptAnswerSchema } from './AttempAnswer';

@Schema({
  timestamps: true,
})
export class QuizAttempt {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Quiz',
  })
  quiz: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  student: Types.ObjectId;

  @Prop({
    required: true,
    type: Date,
  })
  startedAt: Date;

  @Prop({
    type: Date,
    default: null,
  })
  finishedAt?: Date;

  @Prop({
    type: [AttemptAnswerSchema],
    default: [],
  })
  answers: AttemptAnswer[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  correctAnswers: number;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);
