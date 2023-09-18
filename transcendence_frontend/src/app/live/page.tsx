'use client'
import React, { useRef, useEffect, useState } from 'react'
import Layout from 'src/component/Layout'
import styles from './live.module.css'
import LiveGamesList from 'src/component/live/LiveGamesList';
import axios from 'axios';
import { Socket, io } from 'socket.io-client';
import { AuthGuard } from 'src/api/HOC';


export interface User {
  id: number;
  username: string;
  imageUrl: string;
}

export interface Game {
  id: any;
  user1: User;
  user2: User;
  score: string;
  mode: string;
}

interface GameData {
  gameId: number;
  player1ID: number;
  player2ID: number;
  scores: {
    player1Score: string;
    player2Score: string;
  };
  mode: string;
}

const Live: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[] | null>(null);
  const socketRef = useRef<Socket | null>(null);

  let apiUrl = process.env.NEXT_PUBLIC_API_URL;


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get<User>(`${apiUrl}/user`, { withCredentials: true });
        setUser(userResponse.data);
      } catch (error) {
        console.log("Erreur lors de la récupération de l'utilisateur :", error);
      }
    };
    
      fetchUser();
    }, []); 

  useEffect(() => {
    let IP = `${apiUrl}/game`;
    socketRef.current = io(IP);
    const socket = socketRef.current;
  
    socket.on('connect', () => {
      socket.emit('getAllGames');
      const intervalId = setInterval(() => {
        socket.emit('getAllGames');
      }, 300);
      return () => clearInterval(intervalId);
    });

    const fetchUserInfo = async (userId: number): Promise<User> => {
      try {
        const userResponse = await axios.get<User>(`${apiUrl}/user/${userId}`, { withCredentials: true });
        return userResponse.data;
      } catch (error) {
        console.log("Erreur lors de la récupération de l'utilisateur :", error);
        return {id: userId, username: 'Unknown', imageUrl: 'Unknown'}; // Fallback to unknown data if error occurred
      }
    };
    
    socket.on('gamesData', async (games: Record<string, GameData>) => {
  
      const gamesArrayPromises = Object.values(games).map(async (game: GameData) => {
        const user1 = await fetchUserInfo(game.player1ID);
        const user2 = await fetchUserInfo(game.player2ID);
        
        return ({
          id: game.gameId,
          user1: user1,
          user2: user2,
          score: game.scores.player1Score + '-' + game.scores.player2Score,
          mode: game.mode,
        }) as Game;
      });
    
      const gamesArray = await Promise.all(gamesArrayPromises);
      setGames(gamesArray);
    });
    
  }, []);

  return (
    <AuthGuard>
      <Layout>
          <div className={styles.all}>
            <div className={styles.all_live}>
              <div className={styles.all_live_score} >
                <div className={styles.all_live_score_date}>
                </div>
                <div className={styles.all_live_score_stats}>
                {user && <LiveGamesList games={games} ID42={user.id} />}
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </AuthGuard>
  );
};

export default Live;