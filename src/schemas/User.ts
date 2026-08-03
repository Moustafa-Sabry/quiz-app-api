import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({
      required: true,
      unique: true, 
      lowercase: true,
      trim: true,
    })
    email: string;

    @Prop({
      enum: ['Instructor', 'Learner','Admin'],
      default: 'Learner',
    })
    role: string;

    @Prop({
      required: true,
      select: false,
    })
    password: string;

    @Prop()
    phone?: string;

    @Prop()
    profileImage?: string;

    @Prop()
    passwordResetToken?: string;

    @Prop()
    passwordResetExpires?: Date;

    @Prop({ default: 0 })
    passwordResetRequests: number;

    @Prop()
    passwordResetWindow?: Date;

    @Prop()
    passwordChangedAt?: Date; 
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});