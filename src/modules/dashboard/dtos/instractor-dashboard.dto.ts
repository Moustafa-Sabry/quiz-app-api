export class InstructorDashboardDto {
  upcomingQuizzes: {
    id: string;
    title: string;
    scheduledDate: Date;
    enrolledCount: number;
    accessCode: string;
  }[];

  topStudents: {
    id: string;
    firstName: string;
    lastName: string;
    classRank: number;
    averageScore: number;
    avatar?: string;
  }[];
}