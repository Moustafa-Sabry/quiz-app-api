import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @MaxLength(200)
  @MinLength(2)
  firstName: string;

  @MaxLength(200)
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
  
  @IsString()
  confirmPassword: string;

  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  profileImage?: string;

}