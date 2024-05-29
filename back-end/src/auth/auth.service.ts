import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ResetPassDto } from './dto/resetPass.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto'
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailerService
  ){}

  async signIn(createAuthDto: CreateAuthDto) {
    try {
      const findUser = await this.usersRepository.findOne({
        where:{email: createAuthDto.email}
      })

      if (!findUser) {
        return {
          message: 'Você ainda não se registrou.',
          status: 400
        }
      }

      const passwordIsValid = await bcrypt.compare(createAuthDto.senha, findUser.senha)

      if (!passwordIsValid) {
        return {
          message: 'Email ou senha incorretos. Tente novamente',
          status: 400
        }
      }

      const payload = {
        sub: findUser.id,
        username: findUser.nome
      }

      return {
        //O método signAsync gera o token de acordo com payload do user
        result: await this.jwtService.signAsync(payload),
        status: 200
      }

    } catch (error) {
      console.error(error);
      return {
        message: 'Devido a erro interno não foi possível realizar o login',
        status: 500
      }
      
    }
  }

  async verifyToken(request:Request){
    try {
      //Pegando token do campo authorization no cabeçalho da requisição
      const getToken = request.headers.authorization.split(' ')

      //varificando se o token é válido
      const validateToken = await this.jwtService.verifyAsync(getToken[1])
      
      if (validateToken.sub && validateToken.username) {
        const user = await this.usersRepository.findOne({
          where: {
            id: validateToken.sub
          },
          select: {
            id: true,
            nome: true,
            email: true,
            photo: true 
          }
        })
        return {
          result: {
            valid: true,
            user
          },
          status: 200
        }
      }
      
    } catch (error) {
      console.error(error);
      return {
        result: {
          valid: false,
          user: {}
        },
        status: 200
      }
    }
  }

  async forgotPassword(request:Request){
    try {
      const {email} = request.query

      const findUser = await this.usersRepository.findOne({
        where: {
          email: String(email)
        }
      })

      if (!findUser) {
        return{
          message: 'Nenhum usuário cadastrado com esse email foi encontrado.',
          status: 400
        }
      }

      //criando um token random
      const resetPassToken = crypto.randomBytes(20).toString('hex')
      //definindo que o token será válido por 1 hora.
      const now = new Date()
      now.setHours(now.getHours() + 1)

      await this.usersRepository.update(findUser.id, {
        resetPassToken,
        resetPassExpires: now
      })

      await this.mailService.sendMail({
        to: findUser.email,
        from: "Equipe My Task <mytask@mytask.com.br>",
        subject: 'Recuperação de Senha',
        html: `<p>Olá ${findUser.nome}, clique no link para prosseguir com a recuperação de senha. <a href="http://localhost:3000/resetpass/?resetPassToken=${resetPassToken}" target="_blank">Recuperar senha</a></p> `
      })

      return{
        message: 'Email enviado com sucesso.',
        status: 200
      }
      
    } catch (error) {
      console.error(error)
      return {
        message: 'Devido a um erro interno não possível recuperar a senha.',
        status: 500
      }
    }
  }

  async resetPass(resetPassDto: ResetPassDto){
    try {
      const findUser = await this.usersRepository.findOne({
        where: {email: resetPassDto.email},
        select: {
          id: true,
          senha: true,
          resetPassExpires: true,
          resetPassToken: true
        }
      })
      const now = new Date()

      if (!findUser) {
        return{
          message: 'Nenhum usuário cadastrado com esse email foi encontrado.',
          status: 400
        }
      }
      
      if (resetPassDto.resetPassToken !== findUser.resetPassToken) {
        return{
          message: 'Token inválido.',
          status: 400
        }
      }

      if(now > findUser.resetPassExpires){
        return {
          message: 'Token expirado, refaça o processo de envio de email.',
          status: 400
        }
      }

      const hashedPassword =  await bcrypt.hash(resetPassDto.senha, 10)

      await this.usersRepository.update(findUser.id, {
        senha: hashedPassword
      })

      return {
        message: 'Senha redefinida com sucesso.',
        status: 200
      }

    } catch (error) {
      console.error(error)
      return{
        message: 'Devido a um erro interno não foi possível redefinir a senha.',
        status: 500
      }
    }
  }
}
