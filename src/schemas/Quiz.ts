import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { difficultyLevelenum, Duration, CategoryType } from 'src/common/enums';
@Schema({
  timestamps: true,
})
export class Quiz {
  @Prop({
    required: true,
    trim: true,
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
    enum: Duration,
  })
  duration: Duration;
  @Prop({
    required: true,
    type: Number,
    min: 1,
    max: 100,
  })
  numberOfQuestions: number;
  @Prop({
    required: true,
    type: Number,
    min: 1,
  })
  scorePerQuestion: number;
  @Prop({
    required: true,
    type: Number,
    min: 1,
    max: 10,
    default: 1,
  })
  maxAttempts: number;
  @Prop({
    required: true,
    type: Date,
  })
  scheduledDate: Date;
  @Prop({
    default: false,
  })
  isDeleted: boolean;
  @Prop({
    required: true,
    enum: difficultyLevelenum,
  })
  difficultyLevel: difficultyLevelenum;
  @Prop({
    required: true,
    enum: CategoryType,
  })
  category: CategoryType;
  @Prop({
    required: true,
    type: [{ type: Types.ObjectId, ref: 'Group' }],
  })
  assignedToGroups: Types.ObjectId[];
  @Prop({
    required: true,
    type: [{ type: Types.ObjectId, ref: 'Question' }],
  })
  questions: Types.ObjectId[];
  @Prop({
    default: false,
  })
  randomize: boolean;
  @Prop({
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6,
    match: /^\d{6}$/,
  })
  accessCode: string;
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  createdBy: Types.ObjectId;
}
export const QuizSchema = SchemaFactory.createForClass(Quiz);
QuizSchema.index(
  { title: 1, createdBy: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);
QuizSchema.pre('validate', async function () {
  if (!this.isNew || this.accessCode) {
    return;
  }

  let code: string;
  let exists: boolean;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();

    exists = !!(await this.db
      .model<Quiz>('Quiz')
      .findOne({
        accessCode: code,
      })
      .exec());
  } while (exists);

  this.accessCode = code;
});
QuizSchema.index({
  category: 1,
  isDeleted: 1,
});
QuizSchema.index({
  assignedToGroups: 1,
});
QuizSchema.index({
  scheduledDate: 1,
  isDeleted: 1,
});
