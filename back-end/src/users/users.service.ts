import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { createClient } from '@supabase/supabase-js';
import { Role } from 'src/entities/role.entity';
import { RoleType } from 'src/authorization/roleType.enum';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      
      const {nome, email, senha} = createUserDto
      const userExist = await this.usersRepository.findOne({
        where: {
          email: createUserDto.email
        }
      })
  
      if (userExist) {
        return {
          message: 'Este email já esta em uso.',
          status: 400
        }
      }

      // Aplicando criptografia na senha
      const hashedPassword = await bcrypt.hash(senha, 10)
  
      const createUser = this.usersRepository.create({
        nome,
        email,
        senha: hashedPassword
      })

      const result = await this.usersRepository.save(createUser)
      //salvando como usuário comum
      const createRole = this.roleRepository.create({
        role: RoleType.User,
        user: result
      })

      await this.roleRepository.save(createRole)

      return {
        result,
        status: 201
      }

    } catch (error) {
      console.error(error);
      return {
        message: "Devido a um erro interno não foi possível realizar o cadastro",
        status: 500
      }
    }
  }

  async profilePicture(id: number, profilePicture: Express.Multer.File){
    try {
      const supabaseUrl = 'https://xdvapiqcagykwavoqzkn.supabase.co'
      const supabaseKey = process.env.SUPABASE_KEY
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      })
      const findUser = await this.usersRepository.findOne({
        where: {
          id
        }
      })

      if (!findUser) {
        return {
          message: 'Usuário não encontrado',
          status: 400
        }
      }

      const {data, error} = await supabase.storage.from('tasklist').upload(
        `profilePictures/user-${findUser.id}-profilePicture`, 
        profilePicture.buffer, 
        {
          //se um arquivo com o mesmo nome for enviado ele sobrescreve
          upsert: true
        }
      )

      if (error) {
        console.error(error);
        return {
            message: 'Devido a um erro interno não foi possível fazer upload da imagem',
            status: 500
        };
      }

      //pegando url da imagem do usuário no supabase
      const imageUrl = supabase.storage.from('tasklist').getPublicUrl(`profilePictures/user-${findUser.id}-profilePicture`)
      //salvando a url da foto de perfil dor usuário no db
      await this.usersRepository.update(id, {photo: imageUrl.data.publicUrl})
      
      return {
        message: "Foto salva com sucesso.",
        status: 201
      }
      
    } catch (error) {

      console.error(error);
      return {
        message: 'Devido a um erro interno não foi possível fazer upload da imagem',
        status: 500
      }
    }
  }

  async findAll() {
    try {
      const result = await this.usersRepository.find({
        relations: {roles: true},
        select: {
          roles: { role: true}
        }
      })

      return {
        result,
        status: 200
      }
    } catch (error) {
      console.error(error);
      return {
        message: "Devido a um erro interno não foi possível realizar a busca",
        status: 500
      }
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.usersRepository.findOne({
        where: {
          id
        },
        select: {
          id: true,
          nome: true,
          email: true,
          photo: true 
        }
      })

      if (!result) {
        return {
          message: 'Usuário não encontrado',
          status: 400
        }
      }
  
      return {
        result,
        status: 200
      }

    } catch (error) {
      console.error(error);
      return {
        message: "Devido a um erro interno não foi possível realizar a busca",
        status: 500
      }
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const userExist = await this.usersRepository.findOne({
        where: {
          id
        }
      })
  
      if (!userExist) {
        return {
          message: 'Usuário não encontardo.',
          status: 400
        }
      }


      if (updateUserDto.senhaNova) {
        //validadndo a senha atual
        const passwordIsValid = await bcrypt.compare(updateUserDto.senha, userExist.senha)
        if (!passwordIsValid) {
          return {
            message: 'Senha atual incorreta. Tente novamente.',
            status: 400
          }
        }
        
        // Aplicando criptografia na senha nova
        const hashedPassword =  await bcrypt.hash(updateUserDto.senhaNova, 10)
  
        const result = await this.usersRepository.update(id, {
          nome: updateUserDto.nome,
          email: updateUserDto.email,
          senha: hashedPassword
        })
  
        return {
          result,
          status: 200
        }
      }

      else{
        const result = await this.usersRepository.update(id, {
          nome: updateUserDto.nome,
          email: updateUserDto.email
        })
  
        return {
          result,
          status: 200
        }
      }


    } catch (error) {
      console.error(error);
      return {
        message: "Devido a um erro interno não foi possível realizar a atualização",
        status: 500
      }
    }
  }

  async remove(id: number) {
    try {
      const result = await this.usersRepository.delete(id)

      return {
        message: 'Usuário removido com sucesso.',
        status: 200
      }

    } catch (error) {
      console.error(error);
      return {
        message: "Devido a um erro interno não foi possível realizar a exclusão",
        status: 500
      }
    }
  }
}
