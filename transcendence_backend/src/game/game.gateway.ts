import {
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    SubscribeMessage,
    WsResponse,
    MessageBody
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { GameService } from './game.service';
  import { Game } from './game.class';
  import { join } from 'path'; 
  import { ClientSession } from 'typeorm';
  
  interface CustomSocket extends Socket {
    playerId?: string;
    userId?: number;
    spectatorId?: string;
    gameId?: string;
  }

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
    namespace: 'game',
    cors: {
      origin: `${apiUrlFront}`,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  })
  export class GameGateway implements OnGatewayInit, OnGatewayConnection {

    constructor(private gameService: GameService) {}
  
    @WebSocketServer()
    server: Server;
  
    games = {};
  
    afterInit(server: Server) {
      console.log('Socket.io server initialized');
    }
  
    handleConnection(client: Socket, ...args: any[]) {
    console.log(colorCodes.green +`Client ${client.id} connected GAME SERVER. from ${client}`+ colorCodes.white);
    const userIdString = client.handshake.query.userId;
    console.log(colorCodes.cyan + "HC GAME SERVER ===> userIdString:" , userIdString + colorCodes.white);
  
    let userId: number;
  
    if (Array.isArray(userIdString)) {
      // Si userIdString est un tableau, prendre la première valeur
      userId = parseInt(userIdString[0], 10);
    } else {
      // Sinon, c'est une chaîne de caractères, alors la convertir directement
      userId = parseInt(userIdString, 10);
    }
    }
  
    getGames() {
        const gameInfos = {};
        for (let gameId in this.games) {
          const game = this.games[gameId];
          gameInfos[gameId] = {
            gameId: game.gameId,
            mode: game.mode,
            player1ID: game.player1ID,
            player2ID: game.player2ID,
            scores: game.scores,
          };
        }
        return gameInfos;
      }
  
    @SubscribeMessage('getAllGames')
    getAllGames(client: Socket, data: any): WsResponse<any> {
      const games = this.getGames();
      client.emit('gamesData', games);
      return;
    }
  
    @SubscribeMessage('joinRoomSpec')
    joinRoomSpec(client: CustomSocket, data: any): void {
        if (!data || typeof data.gameId === 'undefined' || typeof data.ID42 === 'undefined') {
            console.log('Invalid data received');
            return;
        }
        const { gameId, ID42 } = data;
        const game = this.games[gameId];
        if (game) {
            game.assignSpectatorId(client, this.server, ID42);
            client.join(gameId);
            client.gameId = gameId;
            client.emit('gameJoined', {
                gameId: gameId,
                ballStart: game.ball,
                scoresStart: game.scores,
            });
            console.log(`Spectator joined game with ID: ${gameId}`);
        } else {
            console.log('Game not found');
            return;
        }
    }

    @SubscribeMessage('createGame')
    createGame(client: CustomSocket, data: any): void {
      // console.log(`Entering createGame. Client ID: ${client.id}, User ID: ${data.userId}`);
      const { userId, ID42, mode, url } = data;
      console.log('variable mode reçue: ', mode);
      
      let gameIdFromUrl: string | null = null;
      if (url) {
        const match = url.match(/\/game\/(\w+)$/);
        if (match) {
          gameIdFromUrl = match[1];
          console.log(`Game ID from URL: ${gameIdFromUrl}`);
        }
      if (gameIdFromUrl && this.games[gameIdFromUrl]) {
        console.log(colorCodes.cyan+`Entering createGame dans if. Client ID: ${client.id}` + colorCodes.white);
        console.log(colorCodes.magenta+'============P2============' +colorCodes.white)
        console.log(`Game ID from URL: ${gameIdFromUrl}`);
        const game = this.games[gameIdFromUrl];
        if (game.connectedPlayers < game.maxPlayers || game.player2ID === ID42 || game.player1ID === ID42) {
          if (game.player2ID !== ID42 && game.player1ID !== ID42) {
            game.assignPlayerId(client, this.server, userId);
            game.player2ID = ID42;
          }
          else if (game.player1ID === ID42) {
            game.reconnectPlayer(client, this.server, userId);
            game.player1ID = ID42;
          }
          else if (game.player2ID === ID42) {
            game.reconnectPlayer(client, this.server, userId);
            game.player2ID = ID42;
          }
          console.log(`Player 2 ID set: ${game.player2ID}`);
          console.log(colorCodes.cyan+`Entering createGame avant join. Client ID: ${client.id}` + colorCodes.white);
          client.join(gameIdFromUrl);
          client.gameId = gameIdFromUrl;
          client.emit('gameJoined', {
            gameId: gameIdFromUrl,
            ballStart: game.ball,
            scoresStart: game.scores
          });
          console.log(`Player joined game with ID: ${gameIdFromUrl}`);
          if (game.connectedPlayers === game.maxPlayers) {
            this.server.to(gameIdFromUrl).emit('gameReady');
          }
          this.server.emit('gamesData', this.getGames()); 
          return;
        }
        else {
          client.emit('error', { message: 'Game is full' });
        }
      }
      else if (gameIdFromUrl && !this.games[gameIdFromUrl]) {
        console.log(colorCodes.cyan+`Entering createGame dans else if. Client ID: ${client.id}` + colorCodes.white);
        const game = new Game(gameIdFromUrl, 'normal');
        game.assignPlayerId(client, this.server, userId);
        console.log(colorCodes.magenta+'gameMaxplayers=====>>>>>> ', game.maxPlayers+colorCodes.white);
        if (game.connectedPlayers < game.maxPlayers) {
          console.log(colorCodes.magenta+'============P1============' +colorCodes.white)
          this.games[gameIdFromUrl] = game;
          game.private = true;
          game.player1ID = ID42;
          console.log(`Player 1 ID set: ${game.player1ID}`);
          client.join(gameIdFromUrl);
          game.gameId = gameIdFromUrl;
          client.emit('gameCreated', { gameid: gameIdFromUrl });
          console.log(`Game created with ID: ${gameIdFromUrl}`);
        }
        else {
          client.emit('error', { message: 'Game is broken' });
        }
      }
      else {
        console.log(colorCodes.cyan+`Entering createGame dans else. Client ID: ${client.id}` + colorCodes.white);
      // Cherche une partie existante avec des places libres
      for (let gameId in this.games) {
        console.log(colorCodes.magenta+'toutes les games======>: ', this.games+colorCodes.white);
        console.log(colorCodes.cyan+`Entering createGame dans for. Client ID: ${client.id}` + colorCodes.white);
        console.log(colorCodes.cyan+`Entering createGame dans if. Client ID: ${client.id}` + colorCodes.white);
        console.log(colorCodes.magenta+'============P2============' +colorCodes.white)
        const game = this.games[gameId];
        if (game.connectedPlayers < game.maxPlayers || game.player2ID === ID42 || game.player1ID === ID42) {
          if (game.player2ID !== ID42 && game.player1ID !== ID42) {
            game.assignPlayerId(client, this.server, userId);
            game.player2ID = ID42;
          }
          else if (game.player1ID === ID42)
            game.player1ID = ID42;
          else if (game.player2ID === ID42)
            game.player2ID = ID42;
          console.log(`Player 2 ID set: ${game.player2ID}`);
          console.log(colorCodes.cyan+`Entering createGame avant join. Client ID: ${client.id}` + colorCodes.white);
          client.join(gameId);
          client.gameId = gameId;
          client.emit('gameJoined', {
            gameId: gameId,
            ballStart: game.ball,
            scoresStart: game.scores
          });
          console.log(`Player joined game with ID: ${gameId}`);
          if (game.connectedPlayers === game.maxPlayers) {
            this.server.to(gameId).emit('gameReady');
          }
          this.server.emit('gamesData', this.getGames());
          return;
        }
      }
    
      // Crée une partie si pas d'existante avec des places libres
      const gameId = Math.random().toString(36).substring(2, 7);
      console.log(Game);
      const game = new Game(gameId, mode);
      game.assignPlayerId(client, this.server, userId);
      console.log(colorCodes.magenta+'gameMaxplayers=====>>>>>> ', game.maxPlayers+colorCodes.white);
      
      if (game.connectedPlayers < game.maxPlayers) {
        console.log(colorCodes.magenta+'============P1============' +colorCodes.white)
        this.games[gameId] = game;
        game.private === false;
        game.player1ID = ID42;
        console.log(`Player 1 ID set: ${game.player1ID}`);
        client.join(gameId);
        game.gameId = gameId;
        client.emit('gameCreated', { gameid: gameId });
        console.log(`Game created with ID: ${gameId}`);
      } else {
        client.emit('error', { message: 'Game is broken' });
      }
    }
    }
  }
     
    @SubscribeMessage('saveGameData')
    saveGameData(client: Socket, gameData: any): void {
      if (!gameData) {
        console.error('gameData is undefined');
        return;
      }
        const game = this.games[gameData.roomId];
        if (game) {
        game.save += 1;
        if (game.save === 1){
          console.log(colorCodes.blue+ "gameid ===> ", gameData.roomId + colorCodes.white)
          this.gameService.saveGame(game)
          .then(response => {
              console.log('Game data saved successfully:', response);
          })
          .catch(error => {
              console.error('Failed to save game data:', error);
          });
      }
      else
        console.log(colorCodes.red+ "game deja sauvegardé" + colorCodes.white)
      }
    }

    @SubscribeMessage('paddleMove')
    handlePaddleMove(client: Socket, data: any): void {
      const game = this.games[data.gameId];
      console.log(colorCodes.blue+ "gameid + player + y dans paddleMove ===> ", data.gameId + ' ' + data.player +' '  + data.y + colorCodes.white)
      if (game) {
        console.log(colorCodes.blue+'affiche les datas dans PaddleMove :', data+colorCodes.white)
        game.handlePaddleMove(data, client, this.server);
      }
    }
    
    handleDisconnect(client: CustomSocket): void { 
      console.log(`handleDisconnect : Player ${client.playerId} disconnected. Game ID: ${client.gameId}`);
      if (client.gameId !== undefined) {
        console.log(`Deleting game with gameId: ${client.gameId}`);
        delete this.games[client.gameId];
    }
  }

    @SubscribeMessage('gameIdDisconnect')
    handleGameIdDisconnect(client: CustomSocket, gameData: any): WsResponse<void> {
    const game = this.games[gameData.roomId];
    console.log(colorCodes.blue+ "gameid dans gameIdDisconnect ===> ", gameData.roomId + colorCodes.white)
    if (!game.connectedPlayers) {
      console.log(colorCodes.red + "Partie annulée, un joueur a été déconnecté "+ colorCodes.white)
      return;
    }
      console.log(colorCodes.blue+ "1: How many players in this game ? ", game.connectedPlayers + colorCodes.white)
      game.connectedPlayers--;
      console.log(colorCodes.blue+ "2: How many players in this game ? ", game.connectedPlayers + colorCodes.white)
      // Supprimer le joueur de la liste des joueurs actifs.
      delete game.players[gameData.playerId];
        // Traitez la logique de suppression ici
        if (gameData.roomId !== undefined) {
          console.log(`Deleting game with gameId: ${gameData.roomId}`);
          delete this.games[gameData.roomId];
      }
      this.server.emit('gamesData', this.getGames());
      console.log(`GameIdDisconnect : Player ${gameData.playerId} disconnected. Game ID: ${gameData.roomId}`);
    return;
}
    
    @SubscribeMessage('playerDisconnected')
    handlePlayerDisconnected(client: Socket): void {
      client.emit('message', 'Un joueur s\'est déconnecté. Il ne reste qu\'un joueur en jeu.');
    }
}
 