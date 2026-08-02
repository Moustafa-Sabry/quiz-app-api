import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { QuestionService } from './questions.service';
import { CreateQuestionDto } from './dtos/createQuestion.dto';
import { DeleteQuestionDto } from './dtos/deleteQuestion.dto';
import { GetQuestionDto } from './dtos/getQuestion.dto';
import { UpdateQuestionDto } from './dtos/updateQuestion.dto';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionsService: QuestionService) {}

  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }
  @Get()
  async findAll() {
    return this.questionsService.findAll();
  }
  @Delete(':id')
  async remove(@Param() deleteQuestionDto: DeleteQuestionDto) {
    return this.questionsService.remove(deleteQuestionDto.id);
  }
  @Get(':id')
  async findOne(@Param() getQuestionDto: GetQuestionDto) {
    return this.questionsService.findOne(getQuestionDto.id);
  }
  @Patch(':id')
  async update(
    @Param() getQuestionDto: GetQuestionDto,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(getQuestionDto.id, updateQuestionDto);
  }
}
