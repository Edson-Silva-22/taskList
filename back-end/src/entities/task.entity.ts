import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name: 'tasks'})
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @Column({length: 255})
    title: string

    @Column("text")
    description: string

    @Column('int')
    priority: number

    @Column({
        type: "boolean",
        default: false
    })
    completed: boolean

    @Column('datetime')
    expirationDate: Date

    @CreateDateColumn({ name: 'created_at' })
    createAt: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;

    @ManyToOne(() => User, (user) => user.tasks)
    user: User
}