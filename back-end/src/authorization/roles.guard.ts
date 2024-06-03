import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RoleType } from './roleType.enum';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private reflector: Reflector,
        private jwtService: JwtService,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            //Pegando os roles autorizados
            const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (!requiredRoles) {
                return true;
            }
        
            //pegando o token de autenticação do usuário
            const [type, token] = context.switchToHttp().getRequest().headers.authorization?.split(' ') ?? [];
            if (!token || type !== 'Bearer') {
                throw new UnauthorizedException({message: 'Não autorizado', status: 401});
            }
        
            //validando token
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            )
        
            if (!payload) {
                return false
            }
        
            const findUser = await this.usersRepository.findOne({
                where: { id: payload.sub },
                relations: {roles: true},
                select: {
                    id: true,
                    nome: true,
                }
            })
            //pegando os roles desse usuário
            const userRoles = findUser.roles.map((r) => r.role)
            
            return requiredRoles.some((role) => userRoles.includes(role));
        } catch (error) {
            console.error(error)
            if (error == 'TokenExpiredError: jwt expired') {
                throw new UnauthorizedException({message: 'Sessão expirada.', status: 401});
            }
      
            throw new UnauthorizedException({message: 'Não autorizado', status: 401});
        }
    }
}