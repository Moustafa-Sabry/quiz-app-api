import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AnswersEnum } from 'src/common/enums';

@Schema({
  _id: false,
})
export class AttemptAnswer {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Question',
  })
  question: Types.ObjectId;

  @Prop({
    required: true,
    enum: AnswersEnum,
  })
  selectedAnswer: AnswersEnum;
}

export const AttemptAnswerSchema = SchemaFactory.createForClass(AttemptAnswer);
