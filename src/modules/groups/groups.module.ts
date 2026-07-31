import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from 'src/schemas/Group';
import { User, UserSchema } from 'src/schemas/User';
import { GroupsService } from './groups.service';


@Module({
  imports: [
   MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}