import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [RolesGuard],
  exports: [TypeOrmModule]
})
export class AuthorizationModule {}
