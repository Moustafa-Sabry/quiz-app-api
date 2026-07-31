import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Group {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  groupName: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  instructorId: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    required: true,
  })
  learners: Types.ObjectId[];

  @Prop({
    default: 0,
  })
  learnerCount: number;
}

export const GroupSchema = SchemaFactory.createForClass(Group);