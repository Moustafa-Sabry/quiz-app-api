import { Query } from 'mongoose';
import { Quiz } from '../../schemas';

export interface QuizModel {
  findOne(filter: Record<string, unknown>): Query<Quiz | null, Quiz>;
}
