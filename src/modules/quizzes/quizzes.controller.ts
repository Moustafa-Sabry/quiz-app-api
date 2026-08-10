import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dtos/CreateQuiz.dto';
import { DeleteQuizDto } from './dtos/DeleteQuiz.dto';
import { UpdateQuizDto } from './dtos/UpdateQuiz.dto';
import { GetQuizDto } from './dtos/getQuiz';
import { GetQuizzesDto } from './dtos/GetAllQuizs.dto';
import { JwtAuthGuard } from '../../common/gaurds/jwt-auth.guard';
import { RolesGuard } from '../../common/gaurds/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Instructor')
  async create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Instructor')
  async remove(@Param() deleteQuizDto: DeleteQuizDto) {
    return this.quizzesService.remove(deleteQuizDto.id);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Instructor')
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.update(id, updateQuizDto);
  }
  @Get(':id')
  async findOne(@Param() getQuizDto: GetQuizDto) {
    return this.quizzesService.findOne(getQuizDto.id);
  }
  @Get()
  async findAll(@Query() getQuizzesDto: GetQuizzesDto) {
    return this.quizzesService.findAll(getQuizzesDto);
  }
}
