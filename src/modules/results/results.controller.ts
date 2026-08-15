import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from 'src/seeds/common/decorators/roles.decorator';
import { RolesGuard } from 'src/seeds/common/guards/roles.guard';
import { QuizResultService } from './results.service';

@Controller('results')
export class QuizResultController {
  constructor(
    private readonly quizResultService: QuizResultService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor', 'Learner')
  findAll(
    @Req() req,
    @Query('quizId') quizId?: string,
    @Query('groupId') groupId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.quizResultService.findAll(
      req.user.id,
      req.user.role,
      Number(page),
      Number(limit),
      quizId,
      groupId,
    );
  }

  @Get('quiz/:quizId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  getQuizSummary(
    @Param('quizId') quizId: string,
    @Req() req,
  ) {
    return this.quizResultService.getQuizSummary(
      quizId,
      req.user.id,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor', 'Learner')
  findOne(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.quizResultService.findOne(
      id,
      req.user.id,
      req.user.role,
    );
  }
}