import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { CreateChannelDto } from './channel.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChannelGateway } from './channel.gateway';
import * as bcrypt from 'bcryptjs';


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
export class ChannelService {
	userRepository: any;
	userService: any;
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private channelGateway: ChannelGateway,

  ) {}


  // ============ Créations de channels ============
  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
	const { name, password, userId, isprivate, members, admins, owner} = createChannelDto;
 
  const hashedPassword = await bcrypt.hash(password, 10); // Crypter le mot de passe

	const channel = new Channel();
	channel.name = name;
	channel.password = hashedPassword; 
	channel.userId = userId;
	channel.owner = owner;
	channel.isprivate = isprivate;
	channel.members = members;
	channel.admins = admins;


	console.log (channel.name);
	console.log (channel.password);
	console.log (channel.userId);
	console.log (channel.owner);
	console.log (channel.admins);
	console.log (channel.members);


	return this.channelRepository.save(channel);
  }

// ============ Créations de channels ============

// ============ Lister les channels ============
  async getAllChannels(): Promise<Channel[]> {
    return this.channelRepository.find();
  }
// ============ Lister les channels ============
	async getLatestChannel(): Promise<Channel> {
		return this.channelRepository
	  	.createQueryBuilder("channel")
	  	.orderBy("channel.id", "DESC") // Nous nous basons maintenant sur l'ID
	  	.getOne(); // retourne le dernier canal créé
  }

// ============ Obtenir un canal par son nom ============
async getChannelByName(name: string): Promise<Channel | null> {
	try {
	  const channel = await this.channelRepository.findOne({ where: { name: name } });
	  return channel || null;
	} catch (error) {
	  console.error(`Error while trying to find channel with name: ${name}`, error);
	  // throw error;
	}
}


// ============ Update des membres ============
  // Fonction pour mettre à jour un canal
  async updateChannelMembers(name: string, newMembers: number[]): Promise<Channel> {
    const channel = await this.getChannelByName(name);
    if (!channel) {
      throw new NotFoundException('Channel does not exist');
    }
    channel.members = newMembers;
    return this.channelRepository.save(channel);
  }

  async updateChannelAdmins(name: string, newAdmins: number[]): Promise<Channel> {
    const channel = await this.getChannelByName(name);
    if (!channel) {
      throw new NotFoundException('Channel does not exist');
    }
    console.log('newadmin ===>' + newAdmins);
    channel.admins = newAdmins;
    return this.channelRepository.save(channel);
  }

  async updateChannelOwner(name: string, newOwner: number[]): Promise<Channel> {
    const channel = await this.getChannelByName(name);
    if (!channel) {
      throw new NotFoundException('Channel does not exist');
    }
    channel.owner = newOwner;
    return this.channelRepository.save(channel);
  }

  // Fonction pour vérifier si l'utilisateur est l'owner du channel
  isUserOwner(channel: Channel, userId: number): boolean {
    return channel.owner.includes(userId);
  }


   // Fonction pour attribuer le rôle "admin" à un utilisateur dans un channel
   async setAdmin(channelName: string, ownerId: number, username: string): Promise<Channel> {
    // Récupère le channel à partir du nom
    const channel = await this.getChannelByName(channelName);

    if (!channel) {
      throw new NotFoundException('Channel does not exist');
    }

    // Vérifie si l'utilisateur est bien l'owner du channel
    if (!this.isUserOwner(channel, ownerId)) {
      throw new Error("Vous n'êtes pas autorisé à effectuer cette action. Seul l'owner peut attribuer le rôle d'admin.");
    }

    // Récupère l'ID de l'utilisateur à partir de l'username fourni
    const userId = await this.userService.getUserIdByUsername(username);

    if (!userId) {
      throw new NotFoundException(`L'utilisateur avec l'username "${username}" n'a pas été trouvé.`);
    }

    // Vérifie si l'utilisateur est déjà un admin
    if (channel.admins.includes(userId)) {
      throw new Error(`L'utilisateur avec l'ID "${userId}" est déjà un admin du channel.`);
    }

    // Ajoute l'ID de l'utilisateur au tableau "admin" du channel
    channel.admins.push(userId);

    // Enregistre les modifications dans la base de données (ou dans le stockage approprié)
    return this.channelRepository.save(channel);
  }
  // Dans le fichier channel.service.ts
  async banUserFromChannel(channelName: string, banned: number, banneur? : number): Promise<Channel> {
    console.log(`Banning user from channel. Channel: ${channelName}, Banned: ${banned}, Banneur: ${banneur}`);

    const channel = await this.getChannelByName(channelName);

    if (!channel) {
      console.log(`Channel does not exist: ${channelName}`);
      throw new NotFoundException('Channel does not exist');
    }

    if (!channel.banned) {
      channel.banned = [];
    }

    if (!channel.banned.includes(banned)) {
      channel.banned.push(banned);
    }

    if (channel.owner.includes(banneur)) {
      if (channel.admins.includes(banned)) {
        const updatedAdmins = channel.admins.filter(adminId => adminId !== banned);
        channel.admins = updatedAdmins;
        await this.channelRepository.save(channel);
        console.log(`Banned user removed from admins. Updated admins: ${channel.admins}`);
      }
    }

    const updatedMembers = channel.members.filter(memberId => memberId !== banned);
    channel.members = updatedMembers;
    await this.channelRepository.save(channel);
    console.log(`Banned user removed from members. Updated members: ${channel.members}`);
    this.channelGateway.banUserFromChannel(banned, banneur, channelName);

    return channel;
  }






  async kickUserFromChannel(name: string, userId: number, kickerId: number): Promise<Channel> {
    const channel = await this.getChannelByName(name);

    if (!channel) {
      throw new NotFoundException('Channel does not exist');
    }

    if (!channel.members.includes(userId)) {
      throw new BadRequestException('User is not a member of this channel');
    }

    // Retirer l'ID de l'utilisateur du tableau des membres
    const updatedMembers = channel.members.filter(memberId => memberId !== userId);

    // Mettre à jour le canal avec le tableau des membres mis à jour
    channel.members = updatedMembers;
    await this.channelRepository.save(channel);

    // Émettre un événement d'expulsion
    this.channelGateway.kickUserFromChannel(userId, kickerId, name);

    return channel;
  }

  async updateChannel(name: string, newPassword?: string, newIsPrivate?: boolean): Promise<Channel> {
    if (/[<>;]/.test(name) || /[<>;]/.test(newPassword) ) {
      console.error(colorCodes.red + 'Channel name or password contains forbidden characters!'+colorCodes.white);
      return;
    }
    const channel = await this.getChannelByName(name);
    if (!channel) {
      throw new NotFoundException('Channel does not exist');
    }
    if(newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Crypter le nouveau mot de passe
        channel.password = hashedPassword;
    }
    if(newIsPrivate !== undefined) { // vérifie si newIsPrivate est null ou undefined
      channel.isprivate = newIsPrivate;
    }
    return this.channelRepository.save(channel);
  }

async muteUserFromChannel(name: string, muted: number, muteur?: number, mutedDuration? : number): Promise<Channel> {
    const channel = await this.getChannelByName(name);

    if (!channel) {
      throw new NotFoundException('Channel does not exist');
    }

    if (!channel.muted) {
      channel.muted = [];
    }

    if (!channel.members.includes(muted)) {
      throw new BadRequestException('User is not a member of this channel');
    }

    if (!channel.muted.includes(muted)) {
      channel.muted.push(muted);
    }

    if (channel.owner.includes(muteur)) {
      console.log('ownerId test 2 ===>' + muteur);
      if (channel.admins.includes(muted)) {
        channel.muted.push(muted);
		await this.channelRepository.save(channel);
      }
    }

    // Ajouter la logique pour gérer le mute temporaire
    const muteDurationInMilliseconds = mutedDuration * 60000; // 1 minute
    setTimeout(() => {
      // Retirer l'utilisateur du tableau des muets après la durée spécifiée
      const index = channel.muted.indexOf(muted);
      if (index !== -1) {
        channel.muted.splice(index, 1);
    	this.channelRepository.save(channel); // Sauvegarder les modifications
      }
    }, muteDurationInMilliseconds);

    // Mettre à jour le canal avec le tableau des membres mis à jour
    await this.channelRepository.save(channel);

    return channel;
  }

  async deleteChannelByName(name: string): Promise<void> {
	const channel = await this.channelRepository.findOne({ where: { name } });
	if (!channel) {
	  throw new NotFoundException('Channel does not exist');
	}

	await this.channelRepository.remove(channel);
  }


}