export class LearnerDashboardDto {
  upcomingQuizzes: {
    id: string;
    title: string;
    scheduledDateTime: Date;
    enrolledCount: number;
  }[];

  recentResults: {
    id: string;
    quizTitle: string;
    score: number;
    percentage: number;
    submittedAt: Date;
  }[];
}