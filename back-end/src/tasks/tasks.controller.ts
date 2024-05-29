import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseGuards, Put, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Cron } from '@nestjs/schedule';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Res() response: Response) {
    const result = await this.tasksService.create(createTaskDto);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Res() response: Response, @Req() request: Request) {
    const result = await this.tasksService.findAll(request);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Get('tasksCount')
  async tasksCount(@Res() response: Response, @Query('userId') userId: number) {
    const result = await this.tasksService.tasksCount(userId);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Get(':id/:userId')
  async findOne(@Param('id') id: string, @Param('userId') userId: string, @Res() response: Response) {
    const result = await this.tasksService.findOne(+id, +userId);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Res() response: Response) {
    const result = await this.tasksService.update(+id, updateTaskDto);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Delete(':id/:userId')
  async remove(@Param('id') id: string, @Param('userId') userId: string, @Res() response: Response) {
    const result = await this.tasksService.remove(+id, +userId);
    return response.status(result.status).json(result)
  }

  
}
