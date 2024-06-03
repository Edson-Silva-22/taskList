import { Controller, Get, Post, Body, Param, Delete, Res, Req, Put, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { Roles } from 'src/authorization/roles.decorator';
import { RoleType } from 'src/authorization/roleType.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
    const result = await this.usersService.create(createUserDto);
    return response.status(result.status).json(result)
  }

  @Post(':id')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async uploadProfilePicture(
    @Res() response: Response,
    @Param('id') id: string,
    @UploadedFile(new FileValidationPipe()) profilePicture: Express.Multer.File
  ) {
    const result = await this.usersService.profilePicture(+id, profilePicture);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Roles(RoleType.Admin)
  @Get()
  async findAll(@Res() response: Response) {
    const result = await this.usersService.findAll();
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.usersService.findOne(+id);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Res() response: Response) {
    const result = await this.usersService.update(+id, updateUserDto);
    return response.status(result.status).json(result)
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.usersService.remove(+id);
    return response.status(result.status).json(result)
  }
}
