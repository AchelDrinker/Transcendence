import React, {useState, useEffect, useRef} from 'react';
import { io, Socket } from 'socket.io-client';
import { Game } from '../../app/live/page';
import Link from 'next/link';
import styled from 'styled-components';

interface GameProps {
  selectedGame: Game;
  ID42: number | null;
}

const StyledCanvas = styled.canvas`

`;

const LiveGame: React.FC<GameProps> = ({ selectedGame, ID42 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let paddleWidth = 1;
  let paddleHeight = 10;
  let paddleGap = 4;
  let paddle1Y = 50;
  let paddle2Y = 50;
  let scores = { player1Score: 0, player2Score: 0 };
  let ball = { x: 0, y: 0, speedX: 0, speedY: 0 };
  let trail: { x: number; y: number }[] = [];
  const socketRef = useRef<Socket | null>(null);
  // let roomId = selectedGame.id;
  let spectatorId = null;
  let userId = ID42;
  const [roomId, setRoomId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedGame) {
      setRoomId(selectedGame.id);
    }
  }, [selectedGame]);

  useEffect(() => {
    let updateCanvasSize: () => void;
    if (roomId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let IP = `${apiUrl}/game`;
      if (IP) {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        const parentDiv = canvas?.parentElement;
    
        if (!canvas || !context || !parentDiv) {
          return () => {};
        }
    
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
        };
    
        socketRef.current = io(IP);
        const socket = socketRef.current;
        socket.emit('joinRoomSpec', { gameId: roomId, ID42: userId });

    socket.on('spectatorId', (data: { spectatorId: number, ball: { x: number; y: number; speedX: number; speedY: number; }, scores: { player1Score: number; player2Score: number; } , paddle1Y: number, paddle2Y: number }) => {
      spectatorId = data.spectatorId;
      ball = ball;
      scores = scores;
      paddle1Y = paddle1Y;
      paddle2Y = paddle2Y;
      console.log('spectatorId : ', spectatorId);
      drawGame(ball, scores);
    });
    
    // Spectate the game
    socket.on('spectateGame', (gameState: { ball: any; scores: any; paddle1Y: any; paddle2Y: any; }) => {
      let {ball, scores, paddle1Y, paddle2Y} = gameState;
      paddle1Y = gameState.paddle1Y;
      paddle2Y = gameState.paddle2Y;
      scores = gameState.scores;
      drawGame(ball, scores);
    });


    socket.on('gameStopped', function() {
      // afficher un message à l'utilisateur pour informer que le jeu a été arrêté
      alert('Le jeu a été arrêté car un des joueurs s\'est déconnecté.');
    }); 
    
    socket.on('paddleMoved', (data: { playerId: string; newPosition: { y: number; } }) => {
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

    socket.on('gameOver', () => {
      console.log('spectator disconnected');
      socket.disconnect();
      window.location.reload();
    }); 

  }
  }
  return () => {
    window.removeEventListener('resize', updateCanvasSize);
  };
}, [roomId, userId, selectedGame]);

return (
      <StyledCanvas ref={canvasRef} id="pong" />
  );
};

export default LiveGame