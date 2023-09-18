import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwtService: JwtService
  ) {}

  async generateJwt(user) {
    const { id, username } = user;
    const payload = { id, username };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }

  async validateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(id) }});
    return user;
  }

  async enregistrerUtilisateur(data) {
    try {
        const { id, username, imageUrl } = data;
        let { blocked, friends } = data;
  
        // Si blocked ou friends sont null, initialisez-les comme des tableaux vides
        blocked = blocked || [];
        friends = friends || [];
  
        const utilisateur = await this.prisma.user.upsert({
            where: { id: parseInt(id) },
            update: {
                username,
                imageUrl,
                authentification: true,
                blocked,
                // friends,
            },
            create: {
                id: parseInt(id),
                username,
                imageUrl,
                authentification: true,
                twoFactorEnabled: false,
                blocked,
                friends,
            },
        });
        return utilisateur;
    } catch (error) {
        throw new Error(`Erreur lors de l'enregistrement de l'utilisateur : ${error.message}`);
    }
  }
  

  async updateUserImage(id: string, image: Express.Multer.File): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      throw new Error('User not found');
    }
    // Écrivez le fichier image sur le disque
    const imageUrl = `image/${image.originalname}`;
    fs.writeFileSync(imageUrl, image.buffer);
  
    // Mettez à jour l'URL de l'image dans l'objet utilisateur et enregistrez-le dans la base de données
    user.imageUrl = imageUrl;
    await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: user,
    });
  
    return user;
  }
  

}
