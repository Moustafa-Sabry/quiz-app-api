import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from 'src/schemas/Group';
import { Quiz } from 'src/schemas/Quiz';
import { QuizResult } from 'src/schemas/QuizResult';
import { User } from 'src/schemas/User';


@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>,

    @InjectModel(QuizResult.name)
    private readonly quizResultModel: Model<QuizResult>,
  ) {}

  async getInstructorDashboard(instructorId: string) {

    const topStudents = await this.quizResultModel.aggregate([
      {
        $group: {
          _id: '$learnerId',
          averageScore: {
            $avg: '$scorePercentage',
          },
        },
      },
      {
        $sort: {
          averageScore: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $project: {
          id: '$student._id',
          firstName: '$student.firstName',
          lastName: '$student.lastName',
          avatar: '$student.avatar',
          averageScore: 1,
        },
      },
    ]);

    const formattedStudents = topStudents.map((student, index) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      classRank: index + 1,
      averageScore: Number(student.averageScore.toFixed(2)),
      avatar: student.avatar,
    }));

    const quizzes = await this.quizModel.find({
      instructorId,
      scheduledDate: {
        $gt: new Date(),
      },
    })
    .sort({
      scheduledDate: 1,
    })
    .limit(5);

    const upcomingQuizzes: any[] = [];

    for (const quiz of quizzes) {

      const groups = await this.groupModel.find({
        _id: {
          $in: quiz.assignedToGroups,
        },
      });

      let enrolledCount = 0;

      groups.forEach((group) => {
        enrolledCount += group.learners.length;
      });

      upcomingQuizzes.push({
        id: quiz._id,
        title: quiz.title,
        scheduledDateTime: quiz.scheduledDate,
        enrolledCount,
        accessCode: quiz.accessCode,
      });
    }

    return {
      upcomingQuizzes,
      topStudents: formattedStudents,
    };
  }

  async getLearnerDashboard(learnerId:string){


const now = new Date();


// Last 5 Results

const results =
await this.quizResultModel
.find({
 learnerId
})
.sort({
 submittedAt:-1
})
.limit(5)
.populate({
 path:'quizId',
 select:'title scheduledDateTime'
});


const recentResults =
results.map(result=>({

 id: result._id,

 quizTitle:
 result.quizId['title'],

 score:
 result.totalScore,

 percentage:
 result.scorePercentage,

 submittedAt:
 result.submittedAt

}));




// Get groups learner belongs to

const groups =
await this.groupModel.find({
 learners: learnerId
})
.select('_id');



const groupIds =
groups.map(
 group=>group._id
);




// Upcoming quizzes

const quizzes =
await this.quizModel.find({

 assignedToGroups:{
   $in:groupIds
 },

 scheduledDate:{
   $gt:now
 }

})
.sort({
 scheduledDate:1
})
.limit(5);



const upcomingQuizzes =
await Promise.all(
 quizzes.map(async quiz=>{


 const enrolledCount =
 await this.groupModel.countDocuments({
  _id:{
   $in:quiz.assignedToGroups
  }
 });


 return {

 id:quiz._id,

 title:quiz.title,

 scheduledDate:
 quiz.scheduledDate,

 enrolledCount

 };

 })
);



return {

 upcomingQuizzes,

 recentResults

};


}

}