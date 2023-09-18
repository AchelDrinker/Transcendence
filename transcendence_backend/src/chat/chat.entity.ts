import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Matches } from 'class-validator';

@Entity({ name:'Message' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: number;

  @Matches(/^[^<>;]+$/, {
    message: 'Message cannot contain the characters <, >, or ;.',
  })
  @Column()
  message: string;

  @Column()
  date: Date;

  @Column()
  channelId: number;

  @Column()
  username: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => User, user => user.username)
  user: User;
}
