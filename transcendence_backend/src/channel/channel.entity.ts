import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../user/user.entity';
import { IsAlphanumeric } from 'class-validator';

@Entity( { name: 'Channel' })
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @IsAlphanumeric()
  @Column()
  name: string;

  @IsAlphanumeric()
  @Column({ nullable: true })
  password?: string;

  @Column()
  userId: number;

  @Column()
  isprivate: boolean

  @Column('int', { array: true, default: [] })
admins: number[] = [];

@Column('int', { array: true, default: [] })
members: number[] = [];

@Column('int', { array: true, default: [] })
owner: number[] = [];

@Column('int', { array: true, default: [], nullable: true })
banned: number[] = [];

@Column('int', { array: true, default: [], nullable: true })
muted: number[] = [];
}