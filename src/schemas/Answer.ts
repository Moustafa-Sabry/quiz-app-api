import { Prop, Schema } from '@nestjs/mongoose';
import { AnswersEnum } from '../common/enums/Answers.enum';

@Schema({ _id: false })
export class Answer {
  @Prop({
    required: true,
    enum: AnswersEnum,
  })
  key: string;
  @Prop({
    required: true,
    trim: true,
  })
  text: string;
}
