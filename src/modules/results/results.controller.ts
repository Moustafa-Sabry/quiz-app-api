import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { ResultsService } from './results.service';

import { JwtAuthGuard } from '../../common/gaurds/jwt-auth.guard';
import { RolesGuard } from '../../common/gaurds/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Learner')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.resultsService.findAll(user._id);
  }
  attemptId;
  @Get(':attemptId')
  async findOne(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.resultsService.findOne(attemptId, user._id);
  }
}
