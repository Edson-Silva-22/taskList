import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as moment from 'moment-timezone';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailerService
  ){}

  async create(createTaskDto: CreateTaskDto) {
    try {
      const taskExist = await this.taskRepository.findOne({
        where: {title: createTaskDto.title, id: createTaskDto.userId}
      })
      const findUser = await this.usersRepository.findOne({
        where: {id: createTaskDto.userId}
      })

      if (taskExist) {
        return {
          message: `A tarefa ${createTaskDto.title} já foi criada`,
          status: 400
        }
      }

      if (!findUser) {
        return {
          message: "Usuário não encontrado.",
          status: 400
        }
      }

      const createTask = this.taskRepository.create({
          title: createTaskDto.title,
          description: createTaskDto.description,
          priority: createTaskDto.priority,
          //Salvando a data de expiração da task de acordo com o timezone do sistema do usuário usando a lib Moment-Timezone
          expirationDate: moment.tz(`${createTaskDto.expirationDate} 23:59:59`, moment.tz.guess()).format()
      })

      createTask.user = findUser
      
      const result = await this.taskRepository.save(createTask)

      return {
        result,
        status: 201
      }

    } catch (error) {
      console.error(error);
      return {
        message: 'Devido a um erro interno não foi possível realizar o cadastro',
        status: 500
      }
    }
  }

  async findAll(request: Request) {
    try {
      const {userId, titleFilter} = request.query
      const today = new Date()
      today.setHours(0,0,0,0)
      const endToday = new Date()
      endToday.setHours(23,59,59)
      const query = this.taskRepository
      .createQueryBuilder('tasks')
      .select(["tasks", "user.id", "user.nome", "user.email", "user.createAt", "user.updatedAt"])
      .leftJoin('tasks.user', 'user')
      .where('tasks.userId = :userId', {userId})
      
      //Filtrando por tasks concluídas
      if (request.query.queryFilter == "completedFilter") {
        query.andWhere(`tasks.completed = 1`)
      }
      
      //Filtrando pelo título da task
      if (request.query.titleFilter) {
        query.andWhere(`tasks.title LIKE '%${titleFilter}%'`)
      }

      //Filtrando por tarefas pendentes que ainda não foram concluídas
      if (request.query.queryFilter == "expirationFilter") {
        
        query.andWhere(`tasks.expirationDate < '${moment.tz(today.toISOString(), moment.tz.guess()).format()}'`).andWhere('tasks.completed = 0')
      }

      //Filtrando por tarefas que expirarão hoje e ainda não foram concluídas
      if (request.query.queryFilter == "expirationTodayFilter") {
        query.andWhere(`tasks.expirationDate BETWEEN '${moment.tz(today.toISOString(), moment.tz.guess()).format()}' AND '${moment.tz(endToday.toISOString(), moment.tz.guess()).format()}'`).andWhere('tasks.completed = 0')
      }

      let result = await query.getMany()

      //formatando a data de todas as tasks no array para facilitar exibição no front end
      //getDate = dia
      //getMonth() retorna de 0 a 11, então é preciso adicionar 1 para obter o mês correto
      result = result.map((r:any) => {
        return {...r, expirationDate: `${r.expirationDate.getDate()}/${r.expirationDate.getMonth() + 1}/${r.expirationDate.getFullYear()}`}
      })

      return {
        result,
        status: 200
      }

    } catch (error) {
      console.error(error);
      return{
        message: 'Devido a um erro interno não possível realizar a busca.',
        status: 500
      }
    }
  }

  async tasksCount(userId:number){
    try {
      const today = new Date()
      today.setHours(0,0,0,0)
      const endToday = new Date()
      endToday.setHours(23,59,59)

      const expirationTasksCount = await this.taskRepository
      .createQueryBuilder('tasks')
      .select(["tasks", "user.id", "user.nome", "user.email", "user.createAt", "user.updatedAt"])
      .leftJoin('tasks.user', 'user')
      .where('tasks.userId = :userId', {userId})
      .andWhere(`tasks.expirationDate < '${moment.tz(today.toISOString(), moment.tz.guess()).format()}'`)
      .andWhere('tasks.completed = 0').getCount()
      
      const expirationTodayTasksCount = await this.taskRepository
      .createQueryBuilder('tasks')
      .select(["tasks", "user.id", "user.nome", "user.email", "user.createAt", "user.updatedAt"])
      .leftJoin('tasks.user', 'user')
      .where('tasks.userId = :userId', {userId})
      .andWhere(`tasks.expirationDate BETWEEN '${moment.tz(today.toISOString(), moment.tz.guess()).format()}' AND '${moment.tz(endToday.toISOString(), moment.tz.guess()).format()}'`)
      .andWhere('tasks.completed = 0')
      .getCount()

      return{
        result: {expirationTasksCount, expirationTodayTasksCount},
        status: 200
      }

    } catch (error) {
      console.error(error);
      return{
        message: 'Devido a um erro interno não possível realizar a contagem.',
        status: 500
      }
    }
  }

  async findOne(id: number, userId:number) {
    try {
      const result = await this.taskRepository.find({
        where: {
          id,
          userId
        },
        relations: {
          user: true
        },
        select: {
          user: {
            id: true,
            nome: true,
            email: true,
            createAt: true,
            updatedAt: true
          }
        }
      })

      if (result.length == 0) { 
        return {
          message: "Tarefa não encontrada.",
          status: 400
        }
      }
      
      //formatando a data para facilitar exibição no front end
      //getDate = dia
      //getMonth() retorna de 0 a 11, então é preciso adicionar 1 para obter o mês correto
      return {
        result: {...result[0], expirationDate: `${result[0].expirationDate.getDate()}/${result[0].expirationDate.getMonth() + 1}/${result[0].expirationDate.getFullYear()}`},
        status: 200
      }

    } catch (error) {
      console.error(error);
      return{
        message: 'Devido a um erro interno não possível realizar a busca.',
        status: 500
      }
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      const findTask = await this.taskRepository.find({
        where: {
          id, userId: updateTaskDto.userId
        }
      })

      if(findTask.length == 0){
        return {
          message: "Tarefa não encontrada.",
          status: 400
        }
      }

      const result = await this.taskRepository.update({id, userId: updateTaskDto.userId}, updateTaskDto)

      return {
        message: "Tarefa atualizada com sucesso.",
        status: 200
      }

    } catch (error) {
      console.error(error);
      return{
        message: 'Devido a um erro interno não possível realizar a atualização.',
        status: 500
      }
    }
  }

  async remove(id: number, userId: number) {
    try {
      const findTask = await this.taskRepository.find({
        where: {
          id, userId
        }
      })

      if (findTask.length == 0) {
        return {
          message: 'Tarefa não encontrada.',
          status: 400
        }
      }

      const result = await this.taskRepository.delete({id, userId})

      return {
        message: 'Tarefa excluída com sucesso.',
        status: 200
      }

    } catch (error) {
      console.error(error);
      return{
        message: 'Devido a um erro interno não possível realizar a remoção.',
        status: 500
      }
    }
  }

  //método será chamado a cada meia noite
  @Cron('0 0 * * * ', { timeZone: moment.tz.guess() })
  async expirationTask(){
    try { 
      const today = new Date()
      today.setHours(0,0,0,0)
      const endToday = new Date()
      endToday.setHours(23,59,59)
      //pegando os usuário com tarefas pendentes que ainda não forão concluídas e com tarefas que expirarão hoje.
      const query = await this.usersRepository
      .createQueryBuilder('users')
      .select("users")
      .leftJoin('users.tasks', 'tasks')
      .where(`tasks.expirationDate < '${moment.tz(today.toISOString(), moment.tz.guess()).format()}'`)
      .orWhere(`tasks.expirationDate BETWEEN '${moment.tz(today.toISOString(), moment.tz.guess()).format()}' AND '${moment.tz(endToday.toISOString(), moment.tz.guess()).format()}'`)
      .andWhere('tasks.completed = 0')
      .groupBy('users.id')
      .getRawMany()
    
      query.map(async (user) => {
        const {result} = await this.tasksCount(user.users_id)
        
        await this.mailService.sendMail({
          to: user.users_email,
          from: "Equipe My Task <mytask@mytask.com.br>",
          subject: 'Tarefas não finalizadas',
          text: `Olá ${user.users_nome}, voçê tem ${result.expirationTasksCount ? `${result.expirationTasksCount} tarefas pendentes` : ''} ${result.expirationTodayTasksCount ? `${result.expirationTasksCount ? ' e ' : ''} ${result.expirationTodayTasksCount} tarefas que expirarão hoje.` : ''}`
        })
      })
      
    } catch (error) {
      console.error(error)
    }
  }
}
