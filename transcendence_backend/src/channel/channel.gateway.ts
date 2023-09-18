import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';

const colorCodes = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const apiUrlFront = process.env.NEXT_PUBLIC_API_URL_FRONT;

@WebSocketGateway({
  namespace: 'channel',
  cors: {
    origin: `${apiUrlFront}`,
    methods: ['GET', 'POST'],
    credentials: true,
  }
})
export class ChannelGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Channel)
    private messageRepository: Repository<Channel>,
  ) {}
  handleConnection(client: Socket, ...args: any[]) {
    console.log(colorCodes.green+`Client connected: ${client.id} in Channel.gateway`+colorCodes.white);
}

  handleDisconnect(client: Socket) {
    // Logique de déconnexion
  console.log(colorCodes.red+`Client Channel => ${client.id} disconnected in Channel.gateway.`+colorCodes.white);
  // Autres actions à effectuer lors de la déconnexion

  // Éventuellement, émettre un événement pour informer les autres clients de la déconnexion
  this.server.emit('user CHANNEL => disconnected', client.id);
  }



  banUserFromChannel(bannedUser: number, bannerUser: number, channel: string): void {
    console.log(`Emitting userBanned event. BannedUser: ${bannedUser}, BannerUser: ${bannerUser}, Channel: ${channel}`);
    this.server.emit('userBanned', { bannedUser, bannerUser, channel });
  }
  kickUserFromChannel(kickedUser: number, kickerUser: number, channel: string): void {
    console.log(`Emitting userKicked event. KickedUser: ${kickedUser}, KickerUser: ${kickerUser}, Channel: ${channel}`);
    this.server.emit('userKicked', { kickedUser, kickerUser, channel });
  }

}