import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Group, GroupDocument } from "src/schemas/Group";
import { User, UserDocument } from "src/schemas/User";
import { CreateGroupDto } from "./dtos/create-group.dto";
import { UpdateGroupDto } from "./dtos/update-group.dto";


@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  //////////////////////////////////////////////////////////////////
  async create(instructorId: string, body: CreateGroupDto) {
     const { groupName, learners } = body;
     const learnerUsers = await this.userModel.find({
       _id: { $in: learners },
       role: 'Learner',
     });
     if (learnerUsers.length !== learners.length) {
       throw new BadRequestException('One or more learner IDs are invalid',);
      }

      const group = await this.groupModel.create({
       groupName,
       instructorId,
       learners,
       learnerCount: learners.length,
      });

      const result = await this.groupModel.findById(group._id)
      .populate('learners', 'firstName lastName email');

      return {
        message: 'Group created successfully',
        data: result,
      };
    }
    
    ///////////////////////////////////////////////////////////
    async findAllGroups(instructorId: string,page: number = 1,limit: number = 10,search?: string,) {

       const skip = (page - 1) * limit;
       const filter: any = {
         instructorId,
       };

        if (search) {
            filter.groupName = {
            $regex: search,
            $options: 'i',
          };
        }

       const groups = await this.groupModel
         .find(filter)
         .skip(skip)
         .limit(limit)
         .sort({ createdAt: -1 });

       const total = await this.groupModel.countDocuments(filter);

       return {
         data: groups,
         pagination: {
           total,
           page,
           limit,
           totalPages: Math.ceil(total / limit),
         },
       };
}

    /////////////////////////////////////////////////////////////
    async findGroupById(instructorId: string, groupId: string) {
       const group = await this.groupModel
         .findOne({
           _id: groupId,
           instructorId,
         })
         .populate('learners', 'firstName lastName email');

       if (!group) {
         throw new NotFoundException('Group not found');
       }
     
       return {
         message: 'Group retrieved successfully',
         data: group,
       };
     }

     /////////////////////////////////////////////////////////////
     async updateGroup( instructorId: string,groupId: string,body: UpdateGroupDto,) {
        const group = await this.groupModel.findOne({
          _id: groupId,
          instructorId,
        });

        if (!group) {
          throw new NotFoundException('Group not found');
        }

        if (body.learners) {
          const learnerUsers = await this.userModel.find({
            _id: { $in: body.learners },
            role: 'Learner',
          });

        if (learnerUsers.length !== body.learners.length) {
          throw new BadRequestException(
            'One or more learner IDs are invalid',
          );
        }

         group.learners = body.learners as any;
         group.learnerCount = body.learners.length;
       }

        if (body.groupName) {
          group.groupName = body.groupName;
        }

        await group.save();

        const updatedGroup = await this.groupModel
          .findById(group._id)
          .populate('learners', 'firstName lastName email');
      
        return {
          message: 'Group updated successfully',
          data: updatedGroup,
        };
      }

      ////////////////////////////////////////////////////////////////////
      async removeGroup(instructorId: string, groupId: string) {
         const group = await this.groupModel.findOneAndDelete({
           _id: groupId,
           instructorId,
         });

         if (!group) {
           throw new NotFoundException('Group not found');
         }

         return {
           message: 'Group deleted successfully',
         };
       }
}