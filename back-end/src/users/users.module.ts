import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
