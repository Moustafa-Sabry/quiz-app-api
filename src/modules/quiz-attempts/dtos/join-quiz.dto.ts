import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinQuizDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  accessCode: string;
}
