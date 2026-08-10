import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { QuizAttemptsService } from './quiz-attempts.service';
import { JoinQuizDto } from './dtos/join-quiz.dto';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';

import { JwtAuthGuard } from '../../common/gaurds/jwt-auth.guard';
import { RolesGuard } from '../../common/gaurds/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Learner')
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post('join')
  async joinQuiz(
    @Body() joinQuizDto: JoinQuizDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizAttemptsService.joinQuiz(joinQuizDto, user._id);
  }

  @Get(':attemptId')
  async getAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizAttemptsService.getAttempt(attemptId, user._id);
  }

  @Post(':attemptId/submit')
  async submitQuiz(
    @Param('attemptId') attemptId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizAttemptsService.submitQuiz(
      attemptId,
      user._id,
      submitQuizDto,
    );
  }
}
