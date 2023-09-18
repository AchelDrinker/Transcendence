import React, { useEffect, useState } from 'react';
import styles from './ScoreInfoMiddle.module.css'
import { Avatar, Box, Button, ButtonGroup, Typography } from '@mui/material'
import { Game } from '../../app/profil/page';
import Link from 'next/link';
import axios from 'axios';


// ScoreInfo component
interface GameProps {
  games: Game[] | null;
  userId: number | null;
  rank: number | null;
}

export interface User {
  id: number;
  username: string;
  imageUrl: string;
  rank: number | null;
}

const ScoreInfo : React.FC<GameProps> = ({games, userId, rank}) => {

  const [userRanks, setUserRanks] = useState<{[key: number]: number | null}>({});

  let ID42: number;
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserRanks = async () => {
      const newUserRanks: {[key: number]: number | null} = {};
      
      for (const game of games ?? []) {
        if (game) {
          try {
            const user1Info = await fetchUserInfo(game.user1.id);
            const user2Info = await fetchUserInfo(game.user2.id);
            newUserRanks[game.user1.id] = user1Info.rank;
            newUserRanks[game.user2.id] = user2Info.rank;
          } catch (error) {
            console.error('Erreur lors de la récupération des infos de l’utilisateur:', error);
          }
        }
      }
      setUserRanks(newUserRanks);
    };
    
    fetchUserRanks();
  }, [games]);

  const fetchUserInfo = async (userId: number): Promise<User> => {
    try {
      const userResponse = await axios.get<User>(`${apiUrl}/user/${userId}`, { withCredentials: true });
      return userResponse.data;
    } catch (error) {
      console.log("Erreur lors de la récupération de l'utilisateur :", error);
      return {
        id: ID42, 
        username: '',
        imageUrl: '',
        rank: rank,
      };
    }
  };

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
                <div className={styles.container_text_header}>
                  <div className={styles.pseudo_header}>
                    <p className={styles.comp}>Avatar</p>
                    <p className={styles.comp}>Username</p>
                    <p className={styles.comp}>Rank</p>
                    <p className={styles.comp}>Score</p>
                  </div>
                  <p style={{ fontWeight: '700', color: 'white' }}>Mode</p>
                  <div className={styles.pseudo2_header}>
                    <p className={styles.comp}>Score</p>
                    <p className={styles.comp}>Rank</p>
                    <p className={styles.comp}>Username</p>
                    <p className={styles.comp}>Avatar</p>
                  </div>
                </div>
          {games?.map((game, index) => (
            <div key={index} className={`${styles.container_text} ${index === 0 ? 'first-child' : ''} ${index === games.length - 1 ? 'last-child' : ''}`}>
              <div className={styles.pseudo}>
                <Avatar
                  alt="User Avatar"
                  src={game.user1.id === userId ? game.user1.imageUrl : game.user2.imageUrl}
                  sx={{ width: 40, height: 40 }}
                />
                <Link href={`/profil/${game.user1.id === userId ? game.user1.username : game.user2.username}`} passHref>
                  <p >{game.user1.id === userId ? game.user1.username : game.user2.username}</p>
                </Link>
                <p >{game.user1.id === userId ? userRanks[game.user1.id] : userRanks[game.user2.id]}</p>
                <p style={{ marginLeft: '10%'}}>{game.user1.id === userId ? game.score.split('-')[0] : game.score.split('-')[1]}</p>
              </div>
              <p style={{ fontWeight: '700', color: 'white' }}>{game.mode === "boost" ? "Boost" : "Normal"}</p>
              <div className={styles.pseudo2}>
                <p style={{ marginRight: '10%'}}>{game.user1.id === userId ? game.score.split('-')[1] : game.score.split('-')[0]}</p>
                <p >{game.user1.id === userId ? userRanks[game.user2.id] : userRanks[game.user1.id]}</p>
                <Link  href={`/profil/${game.user1.id === userId ? game.user2.username : game.user1.username}`} passHref>
                  <p >{game.user1.id === userId ? game.user2.username : game.user1.username}</p>
                </Link>
                <Avatar
                  alt="User Avatar"
                  src={game.user1.id === userId ? game.user2.imageUrl : game.user1.imageUrl}
                  sx={{ width: 40, height: 40 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreInfo;