import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AnswersEnum } from 'src/common/enums';

@Schema({ _id: false })
export class Answer {
  @Prop({
    required: true,
    enum: AnswersEnum,
  })
  key: AnswersEnum;
  @Prop({
    required: true,
    trim: true,
  })
  text: string;
}
export const AnswerSchema = SchemaFactory.createForClass(Answer);
