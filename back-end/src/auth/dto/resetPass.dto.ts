import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPassDto extends PartialType(CreateAuthDto) {
    @IsNotEmpty({message: 'O token deve ser informado.'})
    @IsString({message: 'O token deve ser uma string'})
    resetPassToken: string
}