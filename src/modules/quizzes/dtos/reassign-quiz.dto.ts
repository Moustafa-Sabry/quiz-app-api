import { IsDateString } from 'class-validator';

export class ReassignQuizDto {
  @IsDateString()
  scheduledDate: string;
}