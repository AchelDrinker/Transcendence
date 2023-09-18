import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game as GameEntity } from './game.entity';
import { PrismaClient, User } from '@prisma/client';


@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameEntity)
    private gamesRepository: Repository<GameEntity>,
    private prisma: PrismaClient,
  ) {}

  async findAllGames(): Promise<GameEntity[]> {
    return this.gamesRepository.find({ relations: ["user1", "user2"] });
  }

  saveGame(game: any) {
    const score = `${game.scores.player1Score} - ${game.scores.player2Score}`;
    return this.prisma.game.create({
      data: {
        user1Id: game.player1ID,
        user2Id: game.player2ID,
        score: score,
        match_date: new Date(),
        mode: game.mode,
      }
    });
  }

  async updateRank(id: number): Promise<User> {
    try {
      const player = await this.prisma.user.findUnique({
        where: { id: +id },
        select: { rank: true },
      });

      if (!player) {
        throw new Error('Joueur non trouvé');
      }
      const updatedPlayer = await this.prisma.user.update({
        where: { id: +id },
        data: { rank: player.rank + 1 },
      });

      return updatedPlayer;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du rang : ${error.message}`);
    }
  }

  async updateinGame(id: number): Promise<User> {
    try {
      const player = await this.prisma.user.findUnique({
        where: { id: +id },
        select: { inGame: true },
      });

      if (!player) {
        throw new Error('Joueur non trouvé');
      }
      const updatedPlayer = await this.prisma.user.update({
        where: { id: +id },
        data: { inGame: !player.inGame },
      });     

      return updatedPlayer;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du rang : ${error.message}`);
    }
  }
}
