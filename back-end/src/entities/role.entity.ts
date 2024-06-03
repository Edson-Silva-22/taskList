import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { RoleType } from "src/authorization/roleType.enum";

@Entity({name: 'roles'})
export class Role {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    role: RoleType

    @CreateDateColumn({ name: 'created_at' })
    createAt: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;

    @ManyToOne(() => User, (user) => user.roles)
    user: User
}