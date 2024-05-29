import { IsNotEmpty, IsString, IsEmail } from "class-validator"

export class CreateUserDto {
    @IsNotEmpty({message: 'O nome deve ser informado'})
    @IsString({message: 'O nome deve ser uma string'})
    nome: string

    @IsNotEmpty({message: 'O email deve ser informada'})
    @IsString({message: 'O email deve ser uma string'})
    @IsEmail({}, {message: 'Email enválido. Tente novamente'})
    email: string

    @IsNotEmpty({message: 'A senha deve ser informada'})
    @IsString({message: 'A senha deve ser uma string'})
    senha: string
}
