
import { User } from '@prisma/client';
import { Response } from 'express';
import { Controller, Get, UseGuards, Req, Res, Redirect, Put, Body, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';

@Controller()
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private authService: AuthService
    ) {}

    @Get('user')
    @UseGuards(AuthGuard('jwt'))
    async getUser(@Req() req, @Res() res: Response) {
        try {
        const user = await this.authService.validateUser(req.user.id);
        res.json(user);
        } catch (error) {
        res.status(500).send("Erreur lors de la récupération de l'utilisateur");
        }
    }

    @Put('user/:id/rank')
    @UseGuards(AuthGuard('jwt'))
    async updateRank(@Param('id') playerId: number): Promise<User> {
      try {
        const updatedPlayer = await this.gameService.updateRank(playerId);
        return updatedPlayer;
      } catch (error) {
        if (error.message.includes('Joueur non trouvé')) {
          throw new NotFoundException(error.message);
        }
        throw new InternalServerErrorException(error.message);
      }
    }

    @Put('user/:id/inGame')
    @UseGuards(AuthGuard('jwt'))
    async updateinGame(@Param('id') playerId: number): Promise<User> {
      try {
        const updatedPlayer = await this.gameService.updateinGame(playerId);
        return updatedPlayer;
      } catch (error) {
        if (error.message.includes('Joueur non trouvé')) {
          throw new NotFoundException(error.message);
        }
        throw new InternalServerErrorException(error.message);
      }
    }
}
