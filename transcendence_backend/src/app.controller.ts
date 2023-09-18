import { Controller, Get, NotFoundException, Param, Post, UseInterceptors, UploadedFile, Put, Body, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user/user.service';
import { User } from './user/user.entity';
import { IsNotEmpty } from 'class-validator';
import { GameService } from './game/game.service';
import { Game } from './game/game.entity';

class UsernameParamDto {
	@IsNotEmpty()
	username: string;
  }

@Controller()
export class AppController {
  constructor(private readonly userService: UserService, private readonly gameService: GameService) {}

  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/user/:id')
  async getUser(@Param('id') userId: string): Promise<User> {
    const parsedUserId = parseInt(userId, 10);
    console.log(parsedUserId);
    const user = await this.userService.findUserById(parsedUserId);
    console.log(user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('/game')
  async getAllGames(): Promise<Game[]> {
    const games = await this.gameService.findAllGames();
    if (!games) {
      throw new NotFoundException('Games not found');
    }
    return games;
  }

  @Put('/user/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateUserImage(
    @Param('id') userId: string,
    @UploadedFile() images: Express.Multer.File,
    ): Promise<User> {
      console.log('image express =>'+images)
    const parsedUserId = parseInt(userId, 10);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const imageUrl = `${apiUrl}/image/${images.filename}`;
    const user = await this.userService.updateUserImage(parsedUserId, imageUrl);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}
@Put('/user/:id/username')
  async updateUsername(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body,
  ): Promise<User> {
    const { username } = body;

    // Vérifier si userId est null ou NaN
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Vérifier si username est défini et n'est pas vide
    if (!username || username.trim() === '') {
      throw new BadRequestException('Username cannot be empty');
    }
  const user = await this.userService.updateUsername(userId, username);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}
@Get('user/exists/:username')
  async usernameExists(@Param() params: UsernameParamDto): Promise<{ exists: boolean }> {
    const { username } = params;

    const exists = await this.userService.usernameExists(username);
    return { exists };
  }

@Get('user/username/:username')
async getUserByUsername(@Param('username') username: string): Promise<User> {
    return this.userService.getUserByUsername(username);
}

}
