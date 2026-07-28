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
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

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
  providers: [AppService],
})
export class AppModule {}
