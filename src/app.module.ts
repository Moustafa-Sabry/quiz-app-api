import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DBConnect } from './config/DbConnect';
import { GroupsModule } from './modules/groups/groups.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { ResultsModule } from './modules/results/results.module';
import { StudentsModule } from './modules/students/students.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    DBConnect,

    AuthModule,
    GroupsModule,
    QuestionsModule,
    QuizzesModule,
    ResultsModule,
    StudentsModule,
    DashboardModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}