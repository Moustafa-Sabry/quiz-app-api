import mongoose, { Schema } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

const UserModel = mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    await UserModel.create({
      name: 'Admin',
      email: 'admin@quiz.com',
      password: '123456',
      role: 'instructor',
    });

    console.log('User created successfully');

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

seed();
