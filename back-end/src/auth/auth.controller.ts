import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ResetPassDto } from './dto/resetPass.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async create(@Body() createAuthDto: CreateAuthDto, @Res() response: Response) {
    const result = await this.authService.signIn(createAuthDto);
    return response.status(result.status).json(result)
  }

  @Get('verify')
  async verifyToken(@Res() response: Response, @Req() request: Request){
    const result = await this.authService.verifyToken(request)
    return response.status(result.status).json(result)
  }

  @Post('forgotpass')
  async forgotPassword(@Res() response: Response, @Req() request: Request) {
    const result = await this.authService.forgotPassword(request);
    return response.status(result.status).json(result)
  }

  @Post('resetpass')
  async resetPass(@Res() response: Response, @Body() resetPassDto: ResetPassDto ) {
    const result = await this.authService.resetPass(resetPassDto);
    return response.status(result.status).json(result)
  }
}
