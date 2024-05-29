import { IsNotEmpty, IsString, IsInt, Max, IsIn } from "class-validator"

export class ProfilePictureDto {
    @IsNotEmpty({message: 'O nome do campo do arquivo deve ser informado'})
    @IsString({message: 'O nome do campo do arquivo deve ser uma string'})
    fieldname: string;

    @IsNotEmpty({message: 'O arquivo deve ter um conteudo'})
    buffer: Buffer;

    @IsNotEmpty({message: 'O tipo do arquivo deve ser informado'})
    @IsString({message: 'O tipo do arquivo deve ser uma string'})
    @IsIn(['image/png'], { message: 'O arquivo deve ser um PNG.' })
    mimetype: string;

    @IsNotEmpty({message: 'O nome original do arquivo deve ser informado'})
    @IsString({message: 'O nome original do arquivo deve ser uma string'})
    originalname: string;

    @IsNotEmpty({message: 'O tamanho do arquivo deve ser informado'})
    @IsInt({message: 'O tamanho do arquivo deve ser um inteiro'})
    @Max(2 * 1024 * 1024, {message: 'O tamanho limite do arquivo é de 2 megabytes'}) // 2 MB em bytes
    size: number;
}