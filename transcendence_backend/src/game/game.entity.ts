import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {User} from "../user/user.entity";

@Entity({ name: 'Game' })
export class Game {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.games1)
    user1: User;

    @ManyToOne(() => User, user => user.games2)
    user2: User;

    @Column()
    score: string;

    @Column()
    mode: string;

    @Column()
    match_date: Date;
}
