// user.entity.ts

// Entity (user.entity.ts) : C'est une représentation
// de votre table de base de données dans le code.
// Elle définit la structure de votre table de base de données,
//  notamment les colonnes et leurs types.

import { Game } from '../game/game.entity';
import { IsAlphanumeric } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsAlphanumeric()
  @Column({ length: 100 })
  username: string;

  @Column()
  authentification: boolean;

  @Column('text', { nullable: true })
  imageUrl: string;

   // Ajout 2FA

   @Column({ nullable: true })
   twoFactorAuthSecret?: string

   @Column({ default: false })
   twoFactorEnabled: boolean;
    chatMessages: any;
    messages: any;

  @Column('int', { array: true, nullable: true })
  friends?: number[];

  @Column('int', { array: true, nullable: true })
  blocked?: number[];

  @OneToMany(() => Game, game => game.user1)
  games1: Game[];

  @OneToMany(() => Game, game => game.user2)
  games2: Game[];

  @Column({ select: false, nullable: true })
  authConfirmToken?: string;

  @Column({ nullable: true })
  inGame?: Boolean;

  @Column({ nullable: true })
  rank?: number;

}

// //Vous avez raison : votre entité User décrit la structure et la forme 
// des données que vous attendez pour un utilisateur, mais elle ne fait rien pour 
// assainir (ou "sanitizer") ces données. L'utilisation de TypeORM (comme vous le faites) 
// offre une certaine protection contre les injections SQL en utilisant des requêtes 
// paramétrées, ce qui signifie que les données transmises sont traitées 
// comme des données et non comme une partie de la requête SQL elle-même.