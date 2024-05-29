import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty({message: 'O email deve ser informado'})
    @IsEmail({}, {message: 'Email enválido. Tente novamente'})
    @IsString({message: 'O email deve ser uma string'})
    email: string

    @IsNotEmpty({message: 'A senha deve ser informada'})
    @IsString({message: 'A senha deve ser uma string'})
    senha: string
}
