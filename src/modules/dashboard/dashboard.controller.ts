import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { Roles } from 'src/seeds/common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {

  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('instructor')
  @Roles('Instructor')
  async getInstructorDashboard(
    @Req() req,
  ) {

    return this.dashboardService.getInstructorDashboard(
      req.user.id,
    );

  }

   @Get('learner')
  @Roles('Learner')
  async getLearnerDashboard(
    @Req() req: Request
  ) {

    const learnerId = (req as any).user.id;

    return this.dashboardService.getLearnerDashboard(
      learnerId
    );
  }

}