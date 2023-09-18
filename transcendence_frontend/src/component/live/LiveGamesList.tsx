import React, { useEffect, useState } from 'react'
import styles from './LiveGamesList.module.css'
import { Avatar, Box, Button, ButtonGroup, Typography } from '@mui/material'
import { Game } from '../../app/live/page';
import LiveGame from './LiveGame';
import axios from 'axios';
import Link from 'next/link';

interface GameProps {
  games: Game[] | null;
  ID42: number;
}

export interface User {
  id: number;
  username: string;
  imageUrl: string;
}

const LiveGamesList: React.FC<GameProps> = ({ games, ID42 }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

  if (selectedGame) {
    console.log(selectedGame, ID42);
    return <LiveGame selectedGame={selectedGame} ID42={ID42} />;
  }

  return (
      <div>
         <div
                style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop:'-80px',
                }}
                >
                  <Typography variant="h5" gutterBottom sx={{
                    margin:'0',
                    color:'white',
                  }}>
                    </Typography>
                    <div className={styles.container}>
                    {games && games?.map((game, index) => (
                      <div key={index} className={styles.container_text} onClick={() => setSelectedGame(game)}>
                        <div key={index} className={styles.container_text}>
                          <div className={styles.pseudo}>
                          <Avatar
                            alt="User Avatar"
                            src={game.user1.imageUrl}
                            sx={{ width: 40, height: 40 }}
                            />
                            <p className={styles.comp}>{game.user1.username}</p>
                            <p className={styles.comp}>{game.score.split('-')[0]}</p>
                          </div>
                          <p style={{fontWeight:'700', color:'white'}}>{game.mode === "boost" ? "Boost" : "Normal"}</p>
                          <div className={styles.pseudo2}>  
                            <p className={styles.comp}>{game.score.split('-')[1]}</p>
                            <p className={styles.comp}>{game.user2.username}</p>
                          <Avatar
                            alt="User Avatar"
                            src={game.user2.imageUrl}
                            sx={{ width: 40, height: 40 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
          </div>
      </div>
  )
}
export default LiveGamesList