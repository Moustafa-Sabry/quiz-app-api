import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dtos/CreateQuiz.dto';
import { DeleteQuizDto } from './dtos/DeleteQuiz.dto';
import { UpdateQuizDto } from './dtos/UpdateQuiz.dto';
import { GetQuizDto } from './dtos/getQuiz';
import { GetQuizzesDto } from './dtos/GetAllQuizs.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/seeds/common/guards/roles.guard';
import { Roles } from 'src/seeds/common/decorators/roles.decorator';
import { ReassignQuizDto } from './dtos/reassign-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  async create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }
  @Delete(':id')
  async remove(@Param() deleteQuizDto: DeleteQuizDto) {
    return this.quizzesService.remove(deleteQuizDto.id);
  }
  @Patch(':id')
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
  @Post(':id/reassign')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  reassignQuiz(
    @Param('id') id: string,
    @Body() dto: ReassignQuizDto,
    @Req() req,
  ) {
    return this.quizzesService.reassignQuiz(
      id,
      dto,
      req.user.id,
    );
  }
}
