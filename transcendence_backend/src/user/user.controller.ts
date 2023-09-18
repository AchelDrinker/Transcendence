import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ChatGateway } from '../chat/chat.gateway';
import { AuthGuard } from '@nestjs/passport';


@Controller()
export class UserController {
  constructor(private readonly userService: UserService, private readonly chatGateway: ChatGateway) {
  }

  // ===== Récupérer la liste des utilisateurs =====
@Get('users')
@UseGuards(AuthGuard('jwt'))
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }


// ===== Récupérer la liste des usernames =====
@Get('username')
// @UseGuards(AuthGuard('jwt'))
async getAllUsernames(): Promise<string[]> {
  return this.userService.getAllUsernames();
}

 // ===== Récupérer la liste des usernames pour l'autocomplétion =====
  @Get('autocomplete/:query')
  @UseGuards(AuthGuard('jwt')) // <=== Un doute sur l'utilité de ce get
  async getAutocompleteUsernames(@Param('query') query: string) {
    return this.userService.getAutocompleteUsernames(query);
  }

  @Get('users/username/id')
  // @UseGuards(AuthGuard('jwt'))
  async getAllUsernamesId(): Promise<{ id: number; username: string }[]> {
  return this.userService.getAllUsernamesId();
}

// UserController

@Put('users/:userId/friends')
  async addFriend(@Param('userId') userId: number, @Body() body): Promise<User> {
      const { friendId } = body;
      return this.userService.addFriend(userId, friendId);
  }

@Put('users/:userId/blocked')
@UseGuards(AuthGuard('jwt'))
  async addBlocked(@Param('userId') userId: number, @Body() body): Promise<User> {
      const { blockedId } = body;
      return this.userService.addBlocked(userId, blockedId);
  }
  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }
  @Get('users/:userId/friends')
  @UseGuards(AuthGuard('jwt'))
  async getFriends(@Param('userId') userId: number): Promise<User[]> {
    return this.userService.getFriends(userId);
  }
  @Get('users/:userId/blocked')
  @UseGuards(AuthGuard('jwt'))
  async getBlockedUsers(@Param('userId') userId: number): Promise<number[]> {
    return this.userService.getBlockedUsers(userId);
  }
  @Get('users/:userId/online-status')
  getUserOnlineStatus(@Param('userId') userId: number): { online: boolean } {
  const isOnline = this.chatGateway.isUserOnline(userId);

  console.log(`depuis get ===> Endpoint called for userId: ${userId}. Is online? ${isOnline}`);

  return { online: isOnline };

  }

  @Get('users/:id/rank')
  @UseGuards(AuthGuard('jwt'))
  async getUserRankById(@Param('id') userId: number): Promise<number> {
    return this.userService.getUserRankById(userId);
  }

  @Get('users/:id/inGame')
  async getUserinGameById(@Param('id') userId: number): Promise<Boolean> {
    return this.userService.getUserinGameById(userId);
  }

  @Get('users/:userId/two-factor-enabled')
  @UseGuards(AuthGuard('jwt'))
  async isTwoFactorEnabled(@Param('userId') userId: number): Promise<boolean | null> {
    return this.userService.isTwoFactorEnabled(userId);
  }

  @Put('users/:userId/two-factor-enabled')
  @UseGuards(AuthGuard('jwt'))
async updateTwoFactorEnabled(@Param('userId') userId: number, @Body() body: { twoFactorEnabled: boolean }): Promise<boolean> {
  const { twoFactorEnabled } = body;
  const updatedTwoFactorEnabled = await this.userService.updateTwoFactorEnabled({ userId, twoFactorEnabled });
  return updatedTwoFactorEnabled; // Renvoyer la valeur "true" ou "false"
}

@Put('users/:userId/twoFactorAuthSecret')
@UseGuards(AuthGuard('jwt'))
  async enableTwoFactorAuth(@Param('userId') userId: number, verificationCode: string): Promise<boolean> {
    return this.userService.enableTwoFactorAuth(userId, verificationCode);
  }

  @Put('users/:userId/disable-2fa')
  @UseGuards(AuthGuard('jwt'))
  async disableTwoFactorAuth(@Param('userId') userId: number): Promise<User | null> {
    return this.userService.disableTwoFactorAuth(userId);
  }

  @Put('users/:id/rank')
  @UseGuards(AuthGuard('jwt'))
async updateRank(@Param('id') userId: number): Promise<User> {
  try {
    const updatedUser = await this.userService.updateRank(userId);
    return updatedUser;
  } catch (error) {
    if (error.message.includes('Joueur non trouvé')) {
      throw new NotFoundException(error.message);
    }
    throw new InternalServerErrorException(error.message);
  }
}

@Put('users/:id/inGame')
@UseGuards(AuthGuard('jwt'))
async updateinGame(@Param('id') userId: number): Promise<User> {
  try {
    const updatedUser = await this.userService.updateinGame(userId);
    return updatedUser;
  } catch (error) {
    if (error.message.includes('Joueur non trouvé')) {
      throw new NotFoundException(error.message);
    }
    throw new InternalServerErrorException(error.message);
  }
}

}



