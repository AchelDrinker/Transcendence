// user.service.ts

// Service (user.service.ts) : Il s'occupe de la logique métier.
// C'est ici que vous allez chercher des informations dans votre
// base de données ou effectuer d'autres actions liées à l'utilisateur.
// Le service est utilisé par le contrôleur.

// user.service.ts

import { ConflictException, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';

import * as speakeasy from 'speakeasy';

const colorCodes = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserById(userId: number): Promise<User> {
    const options: FindOneOptions<User> = {
      where: { id: userId },
    };

    return this.userRepository.findOneOrFail(options);
  }
  // AJOUT 2FA

	//async enableTwoFactorAuth(userId: any): Promise<User | null> {
	//  const user = await this.userRepository.findOne(userId);
	//  if (user) {
	//	user.twoFactorEnabled = true;
	//	await this.userRepository.save(user);
	//  }
	//  return user;
	//}

	async disableTwoFactorAuth(userId: any): Promise<User | null> {
	  const user = await this.userRepository.findOne(userId);
	  if (user) {
		user.twoFactorEnabled = false;
		await this.userRepository.save(user);
	  }
	  return user;
	}

    async save(user: User): Promise<User> {
    	return await this.userRepository.save(user);
  }
  async updateUserImage(userId: number, imageUrl: string): Promise<User> {
    const user = await this.findUserById(userId);
    user.imageUrl = imageUrl;
    await this.userRepository.save(user);
    return user;
  }
  async updateUsername(userId: number, username: string): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      console.log('User not found');
    }
    if (/[<>;]/.test(username)) {
      console.error(colorCodes.red+ 'Username contains forbidden characters!' + colorCodes.white);
      return;
    }
    if(await this.usernameExists(username)) {
      throw new ConflictException('Username is already taken');
    }
    user.username = username;
    await this.userRepository.save(user);
    return user;
  }
  async usernameExists(username: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ where: { username } });
      return !!user;
    } catch (error) {
      console.error(`Error while trying to find user with username: ${username}`, error);
      throw error;
    }
  }


	// === Récupérer la liste des utilisateurs ===
	async getAllUsers(): Promise<User[]> {
		return this.userRepository.find();
	  }

// === Récupérer la liste des usernames ===
async getAllUsernames(): Promise<string[]> {
    const users = await this.userRepository.find();
    return users.map((user) => user.username);
}

async getAllUsernamesId(): Promise<{ id: number; username: string }[]> {
    const users = await this.userRepository.find();
    return users.map((user) => ({ id: user.id, username: user.username }));
}

async getUserIdByUsername(username: string): Promise<number | null> {
    try {
      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        console.log(`No user found with username: ${username}`);
        return null;
      }
      return user.id;
    } catch (error) {
      console.error(`Error while trying to find user with username: ${username}`, error);
      throw error;
    }
  }


  async getAutocompleteUsernames(query: string): Promise<string[]> {
    // Appelez la fonction 'getAllUsernames' pour obtenir la liste complète des usernames.
    const allUsernames = await this.getAllUsernames();

    // Filtrez les usernames en fonction du query.
    const filteredUsernames = allUsernames.filter((username) =>
      username.toLowerCase().startsWith(query.toLowerCase())
    );

    return filteredUsernames;
  }

  async addFriend(userId: number, friendId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
  });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the friend is already in the friend list
    if (user.friends?.includes(friendId)) {
      throw new Error('This user is already a friend');
    }

    // If the friend list does not exist, create it
    if (!user.friends) {
      user.friends = [];
    }

    user.friends.push(friendId);
    await this.userRepository.save(user);

    return user;
  }

  async addBlocked(userId: number, blockedId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
  });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the friend is already in the friend list
    if (user.blocked?.includes(blockedId)) {
      throw new Error('This user is already a friend');
    }

    // If the friend list does not exist, create it
    if (!user.blocked) {
      user.friends = [];
    }

    user.blocked.push(blockedId);
    await this.userRepository.save(user);


    return user;
  }
  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
  async getUserByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username: username } });
}
async getFriends(userId: number): Promise<User[]> {
  const user = await this.getUserById(userId);
  if (user && user.friends) {
    return await Promise.all(user.friends.map(id => this.getUserById(id)));
  }
  return [];
}
async getBlockedUsers(userId: number): Promise<number[]> {
  console.log("UserId:", userId);
  const user = await this.userRepository.findOne({ where: { id: userId } });
  console.log("Blocked Users:", user?.blocked);
  return user?.blocked;
}


async getUserRankById(userId: number): Promise<number> {
  console.log("UserId:", userId);
  const user = await this.userRepository.findOne({ where: { id: userId } });
  return user?.rank;
}

async getUserinGameById(userId: number): Promise<Boolean> {
  console.log("UserId:", userId);
  const user = await this.userRepository.findOne({ where: { id: userId } });
  return user?.inGame;
}

async updateRank(userId: number): Promise<User> {
  try {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Joueur non trouvé');
    }

    user.rank = (user.rank ?? 0) + 1;

    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour du rang : ${error.message}`);
  }
}


async updateinGame(userId: number): Promise<User> {
  try {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Joueur non trouvé');
    }

    user.inGame = !user.inGame;

    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour du rang : ${error.message}`);
  }
}

async isTwoFactorEnabled(userId: number): Promise<boolean | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user) {
      return user.twoFactorEnabled;
    }

    return null;
  }

async updateTwoFactorEnabled(data: { userId: number; twoFactorEnabled: boolean }): Promise<boolean> {
    try {
      const user = await this.findUserById(data.userId);
      if (user) {
        user.twoFactorEnabled = data.twoFactorEnabled;
        await this.userRepository.save(user);
        return true; // Retourner "true" pour indiquer que la mise à jour a été effectuée avec succès
      }
      return false; // Retourner "false" si l'utilisateur n'est pas trouvé
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la 2FA :', error);
      throw new HttpException('Erreur lors de la mise à jour du statut de la 2FA', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async enableTwoFactorAuth(userId: number, verificationCode: string): Promise<boolean> {
    const user = await this.findUserById(userId);

    if (!user) {
      return false;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuthSecret, // Assurez-vous que votre modèle User contient un champ twoFactorSecret
      encoding: 'base32',
      token: verificationCode,
    });

    if (verified) {
      // Mettez à jour l'état de la 2FA pour l'utilisateur dans la base de données
      user.twoFactorEnabled = true;
      await this.userRepository.save(user);
      return true;
    } else {
      return false;
    }
  }
}
