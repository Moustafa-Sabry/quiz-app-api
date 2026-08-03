import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  ArrayMinSize,
} from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  groupName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  learners?: string[];
}