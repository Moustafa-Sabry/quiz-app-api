import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Question } from './Question';
import { Quiz } from './Quiz';
import { User } from './User';

export type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

@Schema({ _id: false })
class Answer {
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
selectedOption?: string;
}

@Schema({
  timestamps: true,
})
export class QuizAttempt {
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
    required: true,
  })
  attemptStartTime: Date;

  @Prop({
    required: true,
  })
  attemptEndTime: Date;

  @Prop({
    enum: ['IN_PROGRESS', 'SUBMITTED'],
    default: 'IN_PROGRESS',
  })
  status: string;

  @Prop({
    type: [Answer],
    default: [],
  })
  answers: Answer[];
}

export const QuizAttemptSchema =
  SchemaFactory.createForClass(QuizAttempt);