import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Question } from './Question';
import { Quiz } from './Quiz';
import { User } from './User';
import { Group } from './Group';
import { QuizAttempt } from './QuizAttempt';


export type QuizResultDocument = HydratedDocument<QuizResult>;

@Schema({ _id: false })
class AnswerResult {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Question.name,
    required: true,
  })
  questionId: Types.ObjectId;

  @Prop({
  type: String,
  enum: ['A', 'B', 'C', 'D'],
  required: false,
  default: null,
})
selectedOption: string;

  @Prop({
    enum: ['A', 'B', 'C', 'D'],
    required: true,
  })
  correctOption: string;

  @Prop({
    required: true,
  })
  isCorrect: boolean;
}

@Schema({
  timestamps: true,
})
export class QuizResult {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Quiz.name,
    required: true,
  })
  quizId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  learnerId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Group.name,
    required: true,
  })
  groupId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: QuizAttempt.name,
    required: true,
  })
  attemptId: Types.ObjectId;

  @Prop({
    required: true,
  })
  submittedAt: Date;

  @Prop({
    required: true,
  })
  totalScore: number;

  @Prop({
    required: true,
  })
  scorePercentage: number;

  @Prop({
    required: true,
  })
  timeTaken: number;

  @Prop({
    type: [AnswerResult],
    default: [],
  })
  answers: AnswerResult[];
}

export const QuizResultSchema =
  SchemaFactory.createForClass(QuizResult);