import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { RolesGuard } from 'src/seeds/common/guards/roles.guard';
import { Roles } from 'src/seeds/common/decorators/roles.decorator';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';


@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  create( @Req() req, @Body() body: CreateGroupDto,) {
    return this.groupsService.create(req.user.id, body);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  findAllGroups(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
  return this.groupsService.findAllGroups(
    req.user.id,
    Number(page),
    Number(limit),
    search,
  );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  findGroupById(
    @Req() req,
    @Param('id') id: string,
  ) {
   return this.groupsService.findGroupById(req.user.id, id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  updateGroup(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateGroupDto,
  ) {
    return this.groupsService.updateGroup(req.user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  removeGroup(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.groupsService.removeGroup(req.user.id, id);
  }

}