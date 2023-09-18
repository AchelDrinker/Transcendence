import React, {useState, useEffect, useRef, useContext} from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import * as dotenv from 'dotenv';
import PlayButton from './PlayButton';
import Link from 'next/link';
import styles from './game.module.css';
import axios from 'axios';
import { GameModeContext } from '../GameModeContext';


interface GameProps {
  gameID?: string | null;
}

interface User {
  id: number;
  username: string;
  imageUrl: string;
  twoFactorEnabled: boolean;
}

const Game: React.FC<GameProps> = ({ gameID = null }) => {
  const gameMode = useContext(GameModeContext) || (typeof window !== 'undefined' && window.localStorage.getItem('gameMode'));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let paddleWidth = 1;
  let paddleHeight = 10;
  let paddleGap = 4;
  let paddle1Y = 50;
  let paddle2Y = 50;
  let scores = { player1Score: 0, player2Score: 0 };
  let ball = { x: 0, y: 0, speedX: 0, speedY: 0 };
  let trail: { x: number; y: number }[] = [];
  let upArrowPressed = false;
  let downArrowPressed = false;
  let gameStatus: string | ((arg0: string) => void) | null = null;
  const [gameOver, setGameOver] = useState(false);
  let playerId: 'player1' | 'player2' | null = null;
  let roomId = gameID || null;
 
  const socketRef = useRef<Socket | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handlePlayAgain = () => {
    console.log('Play again');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [ID42, setID42] = useState<number | null>(null);

  useEffect(() => {
    const setInGameStatus = async () => {
      try {
        if(user?.id) {
          await axios.put(`${apiUrl}/users/${user?.id}/inGame`,
            {},
            { withCredentials: true }
          );        
          console.log('Variable inGame mis à jour à true');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de inGame:', error);
      }
    };
  
    setInGameStatus();
  }, [user]);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>(`${apiUrl}/user`, { withCredentials: true });
        setUser(response.data);
        setID42(response.data.id);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
  console.log('Game mode: ', gameMode);
  
  if(!user || !ID42 || !user.id) return;

  if (user && user.id) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const parentDiv = canvas?.parentElement;

    if (!canvas || !context || !parentDiv) {
      return () => {};
    }
    socketRef.current = io(`${apiUrl}/game`,{
      query: { socketType: 'game', userId: ID42, mode: gameMode },
      reconnection: false
    });
    const socket = socketRef.current;
    canvas.width = parentDiv.clientWidth;
    canvas.height = parentDiv.clientHeight;

    const updateCanvasSize = () => {
      canvas.width = parentDiv.clientWidth;
      canvas.height = parentDiv.clientHeight;
  };

    const drawPaddle = (x: number, y: number, width: number, height: number, color: string) => {
      context.fillStyle = color;
      context.fillRect(x * canvas.width / 100, y * canvas.height / 100, width * canvas.width / 100, height * canvas.height / 100);
    };

    const drawCircle = (x: number, y: number, radius: number, color: string, alpha: number = 1) => {
      context.fillStyle = `rgba(${color}, ${alpha})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    };

    const setInGameStatus = async () => {
      try {
        if(user?.id) {
          await axios.put(`${apiUrl}/users/${user?.id}/inGame`,
            {},
            { withCredentials: true }
          );
          console.log('Variable inGame mis à jour à true');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de inGame:', error);
      }
    };

    const drawGame = (ball: { x: number; y: number; speedX: number; speedY: number }, scores: { player1Score: number; player2Score: number }) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      drawPaddle(paddleGap, paddle1Y, paddleWidth, paddleHeight, 'white');
      drawPaddle(100 - paddleWidth - paddleGap, paddle2Y, paddleWidth, paddleHeight, 'white');
      // Drawing the ball
      context.fillStyle = "white";
      context.beginPath();
      context.arc(ball.x / 100 * canvas.width, ball.y / 100 * canvas.height, 10, 0, Math.PI*2, false);
      context.closePath();
      context.fill();
      // Drawing the trail
      trail.push({ x: ball.x / 100 * canvas.width, y: ball.y / 100 * canvas.height });
      const trailLength = 15;
      const trailOpacityStep = 1 / trailLength;
      for (let i = trail.length - 1; i >= 0; i--) {
        const { x, y } = trail[i];
        const alpha = 0.8 - (trail.length - i) * trailOpacityStep;
        drawCircle(x, y, 10, '255, 255, 255', alpha);
        if (trail.length - i >= trailLength) {
          break;
        }
      }
      if (trail.length > trailLength) {
        trail.splice(0, trail.length - trailLength);
      }
      // Drawing the net
      context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < canvas.height; i += 40) {
        context.fillRect(canvas.width / 2 - 1, i, 2, 20);
      }
      if (gameStatus === 'Game Started') {
        // Displaying scores
        const fontSize = canvas.width * 0.15;  // 10% of the width of the canvas
        context.font = `600 ${fontSize}px Roboto`;
        const scoreText1 = ` ${scores.player1Score}`;
        const scoreText2 = ` ${scores.player2Score}`;
        const scoreText1Width = context.measureText(scoreText1).width;
        const scoreText2Width = context.measureText(scoreText2).width;
        context.fillStyle = 'rgba(255, 255, 255, 0.08)';
        context.fillText(scoreText1, (canvas.width - scoreText1Width) / 3.5, canvas.height / 1.70);
        context.fillText(scoreText2, (canvas.width - scoreText2Width) / 1.5, canvas.height / 1.70);
      }
    };

    socket.on('waitingForPlayer', () => {
      console.log('Waiting for player to connect...');
      gameStatus = 'Waiting For Player';
      context.clearRect(0, 0, canvas.width, canvas.height);
      const statusFontSize = canvas.width * 0.10;  // 10% of the width of the canvas
      context.font = `600 ${statusFontSize}px Roboto`;
      const statusText = 'Waiting For Player';
      const statusTextWidth = context.measureText(statusText).width;
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillText(statusText, (canvas.width - statusTextWidth) / 2, canvas.height / 2);
    });
       
    socket.on('playerId', (data) => {
      playerId = data.playerId;
      console.log('Player ID: ' + playerId);
    });
 

    socket.on('gameCreated', (data) => {
      const gameId = data.gameid;
      console.log('Game Created with ID:', gameId);
      roomId = gameId;
      gameStatus = 'Waiting For Player';
      context.clearRect(0, 0, canvas.width, canvas.height);
      const statusFontSize = canvas.width * 0.10;  // 10% of the width of the canvas
      context.font = `600 ${statusFontSize}px Roboto`;
      const statusText = 'Waiting For Player';
      const statusTextWidth = context.measureText(statusText).width;
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillText(statusText, (canvas.width - statusTextWidth) / 2, canvas.height / 2);
    });    

    socket.on('disconnect', () => {
      console.log('You are disconnected');
    });

    socket.on('gameReady', () => {
      gameStatus = 'Game Started';
      console.log('Game Started');
      drawGame(ball, scores);
    });   

    socket.on('gameJoined', (data: { gameId: null; ballStart: { x: number; y: number; speedX: number; speedY: number; }; scoresStart: { player1Score: number; player2Score: number; }; }) => {
      console.log('Game Joined with ID:', data.gameId);
      roomId = data.gameId;
      ball = data.ballStart;
      scores = data.scoresStart;
    });

    socket.on('connect', () => {
      
      // Emit 'createGame' event right after the connection is established
      if (user && user.id) {
        console.log(`Creation de game pour le user ${user.id}`);
        socket.emit('createGame', { userId: user.id, ID42: ID42, mode: gameMode, url: window.location.href });
      } else {
        console.log(`Player with the id ${ID42} is not connected to a game. Please create a new game.`);
        return;
      }
      
    });

    socket.on('gameStopped', function() {
      // afficher un message à l'utilisateur pour informer que le jeu a été arrêté
      alert('Le jeu a été arrêté car l\'autre joueur s\'est déconnecté.');
    });

    const updatePlayerRank = async (ID42: number) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.put(`${apiUrl}/users/${user?.id}/rank`,
          {},
          { withCredentials: true }
        );
        console.log('Rank mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rang :', error);
      }
    };

    socket.on('gameOver', (results: { winner: string; loser: string }) => {
      console.log('Game over. Winner is player: ' + results.winner);
      gameStatus = 'Game Over';
      context.clearRect(0, 0, canvas.width, canvas.height);
      const statusFontSize = canvas.width * 0.10;
      context.font = `600 ${statusFontSize}px Roboto`;
     
      let statusText;
      console.log('je suis le playerId : ' + playerId, ' Je suis le winner : ' + results.winner);

      if (playerId === results.winner) {
        statusText = "You Win !";
        console.log('You Win !')
        updatePlayerRank(ID42);
      }
      else if (playerId === results.loser) {
        statusText = "You Lose !";
        console.log('You Lose !')
      }
      else {
        statusText = "Error";
      }
      const statusTextWidth = context.measureText(statusText).width;
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillText(statusText, (canvas.width - statusTextWidth) / 2, canvas.height / 2);
      // Enregistre les données de la partie
      console.log('roomId before sending:', roomId);
      const gameData = {
        roomId: roomId,
        playerId: playerId,
      };
      socket.emit('saveGameData', gameData);
      setGameOver(true);
      setInGameStatus();
      socket.emit('gameIdDisconnect', gameData);
      socket.disconnect();
    });

    socket.on('paddleMoved', (data: { playerId: string; newPosition: { y: number; } }) => {
      console.log('Paddle moved. Player: ' + data.playerId + ', Y: ' + data.newPosition.y);
      if (data.playerId === 'player1') {
        paddle1Y = data.newPosition.y;
      } else if (data.playerId === 'player2') {
        paddle2Y = data.newPosition.y;
      }
      drawGame(ball, scores);
    });

    socket.on('ballUpdate', (updatedBall: { x: number; y: number; speedX: number; speedY: number; }) => {
      ball = updatedBall;
      drawGame(ball, scores);
    });

    socket.on('scoresUpdate', (updatedScores: { player1Score: number; player2Score: number; }) => {
      scores = updatedScores;
      drawGame(ball, scores);
    });

    socket.on('message', (message: any) => {
      console.log(message); // Vous pouvez afficher le message dans la console ou l'afficher dans votre interface utilisateur
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('playerid in handlekeydown ====> ' + playerId)
      if (playerId === null) return;
      let paddleY = 0;
      if (event.key === 'ArrowUp') {
        upArrowPressed = true;
        if (playerId === 'player1') {
          paddle1Y -= 1;
          if (paddle1Y < 0) {
            paddle1Y = 0;
          }
          paddleY = paddle1Y;
        } else if (playerId === 'player2') {
          paddle2Y -= 1;
          if (paddle2Y < 0) {
            paddle2Y = 0;
          }
          paddleY = paddle2Y;
        }
        paddleY = Math.max(Math.min(paddleY, 100 - paddleHeight), 0);
        console.log ('PlayerID + paddleY + gameID ====> ' + playerId + ' ' + paddleY + ' ' + roomId)
        socket.emit('paddleMove', { y: paddleY, player: playerId, gameId: roomId });
      } else if (event.key === 'ArrowDown') {
        downArrowPressed = true;
        if (playerId === 'player1') {
          paddle1Y += 1;
          if (paddle1Y > 100 - paddleHeight) {
            paddle1Y = 100 - paddleHeight;
          }
          paddleY = paddle1Y;
        } else if (playerId === 'player2') {
          paddle2Y += 1;
          if (paddle2Y > 100 - paddleHeight) {
            paddle2Y = 100 - paddleHeight;
          }
          paddleY = paddle2Y;
        }
        paddleY = Math.max(Math.min(paddleY, 100 - paddleHeight), 0);
        console.log ('PlayerID + paddleY + gameID ====> ' + playerId + ' ' + paddleY + ' ' + roomId)
        socket.emit('paddleMove', { y: paddleY, player: playerId, gameId: roomId });
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (playerId === null) return;
      if (event.key === 'ArrowUp') {
        upArrowPressed = false;
      } else if (event.key === 'ArrowDown') {
        downArrowPressed = false;
      }
      // Only emit paddle move if arrow up or down is released
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        let paddleY = (playerId === 'player1') ? paddle1Y : paddle2Y;
        paddleY = Math.max(Math.min(paddleY, 100 - paddleHeight), 0);
        socket.emit('paddleMove', { y: paddleY, player: playerId, gameId: roomId });
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('resize', updateCanvasSize);
    socket.disconnect();
  };
} else {
  console.log('IP is undefined');
}

}, [gameMode, user]);

return (
  <div className={styles.all}>
    <div className={styles.game}>
      <canvas ref={canvasRef} id="pong" />
      <Link href="/play">
        {gameOver && <PlayButton onClick={handlePlayAgain} />}
      </Link>
    </div>
  </div>
);
};

export default Game;