import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateTaskDto {
    @IsNotEmpty({message: 'O título deve ser informado'})
    @IsString({message: 'O título deve ser uma string'})
    title: string

    @IsNotEmpty({message: 'A descrição deve ser informada'})
    @IsString({message: 'A descrição deve ser uma string'})
    description: string

    @IsNotEmpty({message: 'A prioridade deve ser informada'})
    @IsNumber({}, {message: 'A prioridade deve ser um number'})
    priority: number

    @IsNotEmpty({message: 'Uma data de expiração para a tarefa deve ser informada'})
    @IsString({message: 'A data de expiração deve ser uma string'})
    expirationDate: Date

    @IsNotEmpty({message: 'É necessário informar se a tarefa esta completa ou não.'})
    @IsBoolean({message: 'O campo completed deve ser um boolean'})
    completed: boolean

    @IsNotEmpty({message: 'O userId deve ser informado'})
    @IsNumber({}, {message: 'O userId deve ser um number'})
    userId: number
}
