import { Controller, Get, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../../common/gaurds/jwt-auth.guard';
import { RolesGuard } from '../../common/gaurds/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Learner')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('learner')
  async getLearnerDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getLearnerDashboard(user._id);
  }
}
