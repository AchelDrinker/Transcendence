import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './chat.entity';
import { Channel } from 'diagnostics_channel';
import { UserService } from '../user/user.service';

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
  namespace: 'chat',
  cors: {
    origin: `${apiUrlFront}`, 
    methods: ['GET', 'POST'],
    credentials: true,
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: { [userId: string]: string } = {};
  private userToSocketMap = new Map<number, Socket>();

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private userService: UserService,
     // Structure pour stocker la correspondance
  ) {}

  @SubscribeMessage('authenticate')
  authenticate(client: Socket, userId: string): void {
    this.userSockets[userId] = client.id;
    console.log(`User ${userId} connected with socket ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(colorCodes.green +`Client ${client.id} connected ChatGateway. from ${client}`+ colorCodes.white);
    const userIdString = client.handshake.query.userId;
    console.log(colorCodes.cyan + "HC Chat gateway ===> userIdString:" , userIdString + colorCodes.white);
  
    let userId: number;
  
    if (Array.isArray(userIdString)) {
      // Si userIdString est un tableau, prendre la première valeur
      userId = parseInt(userIdString[0], 10);
    } else {
      // Sinon, c'est une chaîne de caractères, alors la convertir directement
      userId = parseInt(userIdString, 10);
    }
  
    this.userToSocketMap.set(userId, client);
    // console.log("Current userToSocketMap:", this.userToSocketMap);
  
    const messages = await this.messageRepository.find();
    client.emit('chat complet', messages);
  }

  handleDisconnect(client: Socket) {
    console.log(colorCodes.red+`Client ${client.id} disconnected from ChatGateway ${client}.`+colorCodes.white);
  
    const userId = [...this.userToSocketMap.entries()]
                  .find(([_, socket]) => socket.id === client.id)?.[0];
    
    if (typeof userId === 'number') {
      this.userToSocketMap.delete(userId);
      // console.log(`User ID ${userId} disconnected.`);
    } else {
      console.log('Could not find user ID for disconnected client.');
    }
  
    // Éventuellement, émettre un événement pour informer les autres clients de la déconnexion
    this.server.emit('user disconnected', client.id);
  }
  

 
  

  @SubscribeMessage('chat message')
  async handleMessage(@MessageBody() message: { text: string; user: User; channelId: number; }): Promise<void> {
    //recupere tous les user present en db
    const userList = await this.userService.getAllUsers();
    //grace a la liste de user recupere, recuperere la liste des personnes bloque pour chaque userid de la liste
    
    if (/[<>;]/.test(message.text)) {
      console.error(colorCodes.red+ 'Message contains forbidden characters!' + colorCodes.white);
      return;
    }

    const newMessage = new Message();
    newMessage.sender = message.user.id;
    newMessage.message = message.text;
    newMessage.date = new Date();
    newMessage.channelId = message.channelId;
    newMessage.user = message.user;
    newMessage.username = message.user.username;
    newMessage.imageUrl = message.user.imageUrl;
  

    console.log(`message from user ${message.user.username} => ${message.text}`);

    await this.messageRepository.save(newMessage);

    userList.forEach(async (user) => {
      const blockedUsers = await this.userService.getBlockedUsers(user.id); // Liste des utilisateurs bloqués pour cet utilisateur
  
      // Trouvez la connexion client pour cet utilisateur (vous devrez peut-être le gérer séparément)
      const client = this.getClientByUserId(user.id);
  
      // Si l'utilisateur n'a pas bloqué l'expéditeur, envoyez le message
      if (client && !blockedUsers.includes(message.user.id)) {
        client.emit('chat message', newMessage);
      }
    });
  }
  private getClientByUserId(userId: number): Socket | undefined {
    return this.userToSocketMap.get(userId);
  }
  private parseInv(message: string): { recipient: string, content: string } | null {
    const regex = /^@inv\s(\S+)\s(.+)$/;
    const match = message.match(regex);
  
    // Vérifiez d'abord si "match" est non nul
    if (match) {
      console.log("match =>", match);
      console.log("match[1] =>", match[1]);
      console.log("match[2] =>", match[2]);
  
      if (match[1] && match[2]) {
        return { recipient: match[1], content: match[2] };
      }
    }
  
    console.log('bad format');  // Pas besoin de deux logs distincts, car vous avez déjà vérifié match[1] et match[2] ci-dessus
    return null;
  }

  @SubscribeMessage('InvitationDemande')
  async handleInvitationDemande(@MessageBody() data: { text: string; user: User; channelId: number; }): Promise<void> {

    if (/[<>;]/.test(data.text)) {
      console.error(colorCodes.red+ 'Message contains forbidden characters!' + colorCodes.white);
      return;
    }

    const parsedMessage = this.parseInv(data.text);
    if (parsedMessage === null) {
      console.log("format du message incorrect {[usage : [@inv] [username] [roomName]]}")
      return;
    }
    //check si le user existe en db
    const sendto = await this.userService.getUserIdByUsername(parsedMessage.recipient)
    console.log(sendto)

    if(sendto === null){
      return;
    }
    const senderSocket = this.getClientByUserId(data.user.id);
    const recipientSocket = this.getClientByUserId(sendto);
    // console.log("recipientSocket =>", recipientSocket);
    if(!recipientSocket){
      console.log("ce user n est pas connect au chat donc n a pas de socketID!!")
      return;
    }

    const newMessage = new Message();
    newMessage.sender = data.user.id;
    newMessage.message = `inv: ${apiUrlFront}/game/${parsedMessage.content}`;
    newMessage.channelId = data.channelId;
    newMessage.date = new Date();
    newMessage.user = data.user;
    newMessage.username = data.user.username;
    newMessage.imageUrl = data.user.imageUrl;

    recipientSocket.emit('inv', newMessage);
    senderSocket.emit('inv', newMessage);
  }

  @SubscribeMessage('DM')
async handleDirectMessage(@MessageBody() data: { text: string; user: User; channelId: number;}): Promise<void> {
  
  if (/[<>;]/.test(data.text)) {
    console.error(colorCodes.red+ 'Message contains forbidden characters!' + colorCodes.white);
    return;
  }

  const parsedMessage = this.parseDirectMessage(data.text);
  
  if (parsedMessage === null) {
    console.log("format du message incorrect {[usage : [@DM] [username] [text] ]}")
    return;
  }
  //check si le user existe en db
  const sendto = await this.userService.getUserIdByUsername(parsedMessage.recipient)
  
  if(sendto === null){
    return;
  }
  const senderSocket = this.getClientByUserId(data.user.id);
  const recipientSocket = this.getClientByUserId(sendto);
  if(!recipientSocket){
    console.log("ce user n est pas connect au chat donc n a pas de socketID!!")
    return;
  }

 
  
  const newMessage = new Message();
  newMessage.sender = data.user.id;
  newMessage.message = parsedMessage.content;
  newMessage.channelId = data.channelId;
  newMessage.date = new Date();
  newMessage.user = data.user;
  newMessage.username = data.user.username;
  newMessage.imageUrl = data.user.imageUrl;
  
  recipientSocket.emit('DM', newMessage);
  senderSocket.emit('DM', newMessage);

}
private parseDirectMessage(message: string): { recipient: string, content: string } | null {
  const regex = /^@DM\s(\S+)\s(.+)$/;
  const match = message.match(regex);

  // Vérifiez d'abord si "match" est non nul
  if (match) {
    console.log("match =>", match);
    console.log("match[1] =>", match[1]);
    console.log("match[2] =>", match[2]);

    if (match[1] && match[2]) {
      return { recipient: match[1], content: match[2] };
    }
  }

  console.log('bad format');  // Pas besoin de deux logs distincts, car vous avez déjà vérifié match[1] et match[2] ci-dessus
  return null;
}
public isUserOnline(userId: number): boolean {
  console.log(`Checking if user with ID ${userId} is online...`);
  const client = this.getClientByUserId(userId);

  if (client) {
    console.log(`User with ID ${userId} is online.`);
  } else {
    console.log(`User with ID ${userId} is offline.`);
  }

  return client !== undefined;
}
@SubscribeMessage('checkOnlineStatus')
checkOnlineStatus(client: Socket, friendIds: number[]): void {
  const onlineFriendIds = friendIds.filter(id => this.getClientByUserId(id));
  client.emit('onlineFriends', onlineFriendIds);
}



}