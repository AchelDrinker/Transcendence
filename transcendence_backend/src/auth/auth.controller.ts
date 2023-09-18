import { Controller, Get, UseGuards, Req, Res, Redirect, Put, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { User } from '@prisma/client';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('42'))
  fortyTwoAuth() {}

  @Get('login/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req, @Res() res: Response) {
    const apiData = req.user;
    const apiUrlFront = process.env.NEXT_PUBLIC_API_URL_FRONT;

    const utilisateurEnregistre = await this.authService.enregistrerUtilisateur(apiData);

    if (utilisateurEnregistre) {
      const jwt = await this.authService.generateJwt(utilisateurEnregistre);
      res.cookie('jwt', jwt.access_token, { httpOnly: false });
    } else {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur');
    }

    res.redirect(`${apiUrlFront}/login`);
  }
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
  @Put('user/:id/image')
  @UseGuards(AuthGuard('jwt'))
  async updateUserImage(
    @Req() req,
    @Body() body,
    @Param('id') id: string,
  ): Promise<User> {
    const { imageUrl } = body;
    const user = await this.authService.updateUserImage(id, imageUrl);
    return user;
}
}
