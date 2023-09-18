import { Controller, Put, Post, Body, Get, Delete, BadRequestException, Param, NotFoundException, Logger } from '@nestjs/common';
import { CreateChannelDto, AddMembersDto, AddAdminsDto, AddOwnerDto , AddBanUserDto, UpdateChannelDto , AddKickUsersDto, AddMuteUsersDto} from './channel.dto';
import { ChannelService } from './channel.service';
import { Channel } from './channel.entity';
import { channel } from 'diagnostics_channel';
const colorCodes = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}
  private readonly logger = new Logger(ChannelController.name);
// ============ Créations de channels ============
  @Post()
  async createChannel(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
    if (/[<>;]/.test(createChannelDto.name)) {
      console.error(colorCodes.red + 'Channel name or password contains forbidden characters!'+colorCodes.white);
      return;
    }
    try {
      return this.channelService.createChannel(createChannelDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async getAllChannels(): Promise<Channel[]> {
    return this.channelService.getAllChannels();
  }

// ============ Créations de channels ============
    @Get('/latest')
    async getLatestChannel(): Promise<Channel> {

    return this.channelService.getLatestChannel();
    }

// ============ Obtenir un canal par son nom ============
@Get(':name')
async getChannelByName(@Param('name') name: string) {
  const channel = await this.channelService.getChannelByName(name);
  
  if (!channel) {
    throw new NotFoundException('Channel does not exist');
  }
  
  return channel;
}


@Get(':name/admins')
async getChannelAdmins(@Param('name') name: string): Promise<number[]> {
const channel = await this.channelService.getChannelByName(name);
if (!channel) {
  throw new NotFoundException('Channel does not exist');
}
return channel.admins; // suppose que admins est un tableau d'IDs d'utilisateur
}

@Put(':name/members')
async updateChannelMembers(@Param('name') name: string, @Body() updateMembersDto: AddMembersDto): Promise<Channel> {
  return this.channelService.updateChannelMembers(name, updateMembersDto.members);
}

@Put(':name/admins')
async updateChannelAdmins(@Param('name') name: string, @Body() updateMembersDto: AddAdminsDto): Promise<Channel> {
  return this.channelService.updateChannelAdmins(name, updateMembersDto.admins);
}

@Put(':name/owner')
async updateChannelOwner(@Param('name') name: string, @Body() updateOwnerDto: AddOwnerDto): Promise<Channel> {
  return this.channelService.updateChannelOwner(name, updateOwnerDto.owner);
}
@Put(':name/ban')
async banUserFromChannel(@Param('name') name: string, @Body() banUserDto: AddBanUserDto): Promise<Channel> {
  this.logger.log(`Banning user with id ${banUserDto.banned} from channel ${name}`);
  try{
  return this.channelService.banUserFromChannel(name, banUserDto.banned, banUserDto.banneur);
  } catch (error) {
    this.logger.error(`Failed to ban user from channel: ${error.message}`);
    throw error;
  }

}

@Put(':name/kick')
async kickUserFromChannel(@Param('name') name: string, @Body() body: { idToKick: number, kickerId: number }) {
  return this.channelService.kickUserFromChannel(name, body.idToKick, body.kickerId);
}


@Put(':name/mute')
  async muteUserFromChannel(@Param('name') name: string, @Body() muteUsersDto: AddMuteUsersDto): Promise<Channel> {
    const { muted, muteur, mutedDuration } = muteUsersDto;

    if (!mutedDuration || mutedDuration <= 0) {
      throw new BadRequestException('Invalid mute duration');
    }

    this.logger.log(`Muting user with id ${muted} from channel ${name} for ${mutedDuration} minutes`);
    try {
      return this.channelService.muteUserFromChannel(name, muted, muteur, mutedDuration);
    } catch (error) {
      this.logger.error(`Failed to mute user from channel: ${error.message}`);
      throw error;
    }
  }

@Put(':name')
async updateChannel(@Param('name') name: string, @Body() updateChannelDto: UpdateChannelDto): Promise<Channel> {
  if (/[<>;]/.test(name) || /[<>;]/.test(updateChannelDto.password) ) {
    console.error(colorCodes.red + 'Channel name or password contains forbidden characters!'+colorCodes.white);
    return;
  }
  return this.channelService.updateChannel(name, updateChannelDto.password, updateChannelDto.isprivate);
}

@Delete(':name')
async deleteChannel(@Param('name') name: string): Promise<void> {
  try {
    await this.channelService.deleteChannelByName(name);
  } catch (error) {
    // Gérer les erreurs
	this.logger.error(`Failed to delete channel: ${error.message}`);
	throw error;
  }
}

}