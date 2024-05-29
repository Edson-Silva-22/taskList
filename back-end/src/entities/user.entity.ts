import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Task } from "./task.entity";

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column({length: 255})
    nome: string

    @Column({
        type: 'varchar',
        length: 255,
        unique: true
    })
    email: string

    @Column()
    senha: string

    @Column({
        nullable: true
    })
    photo: string

    @Column({select: false, nullable: true})
    resetPassToken: string

    @Column({
        type: 'datetime',
        select: false,
        nullable: true
    })
    resetPassExpires: Date

    @CreateDateColumn({ name: 'created_at' })
    createAt: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;

    @OneToMany(() => Task, (task) => task.user)
    tasks: Task[]
}