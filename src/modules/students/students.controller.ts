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
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from 'src/seeds/common/guards/roles.guard';
import { Roles } from 'src/seeds/common/decorators/roles.decorator';
import { StudentService } from './students.service';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UpdateStudentDto } from './dtos/update-student.dto';


@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  create(
    @Body() createStudentDto: CreateStudentDto,
    @Req() req,
  ) {
    return this.studentService.create(
      createStudentDto,
      req.user.id,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Instructor')
  findAll(
    @Req() req,
    @Query('groupId') groupId?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
  return this.studentService.findAll(
    req.user.id,
    Number(page),
    Number(limit),
    groupId,
    search,
  );
}

   @Put(':id')
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Roles('Instructor')
   update(
     @Param('id') id: string,
     @Body() dto: UpdateStudentDto,
     @Req() req,
   ) {
     return this.studentService.update(
      id,
      dto,
      req.user.id,
  );
}

  @Delete(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Instructor')
delete(
  @Param('id') id: string,
  @Req() req,
) {
  return this.studentService.delete(
    id,
    req.user.id,
  );
}
}