'use client'
import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react'
import Layout from 'src/component/Layout'
import { Avatar, Box, Button, ButtonGroup, Switch, TextField, Typography, alpha, styled } from '@mui/material'
import { pink } from '@mui/material/colors';
import styles from '../profil.module.css'
import ScoreInfo from 'src/component/scoreboard/ScoreInfoMiddle';
import axios, { Axios } from 'axios';
import { useRouter } from 'next/router'
import { AuthGuard } from 'src/api/HOC';

export interface User {
    id: number;
    username: string,
    imageUrl: string,
    twofactorEnabled: boolean;
	rank: number;
  }

interface pageProps{
  params:{username:string}
}

export interface Game {
  user1: User;
  user2: User;
  score: string;
  mode: string;
  date: string;
}

 const ProfilUsername: React.FC<pageProps> = ({params}) => {
    const [user, setUser] = useState<User | null>(null)
    const [games, setGames] = useState<Game[] | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const userResponse = await axios.get<User>(`${apiUrl}/user/username/${params.username}`, { withCredentials: true });
        setUser(userResponse.data);
        const fetchGames = async () => {
          try {
            const gamesResponse = await axios.get<Game[]>(`${apiUrl}/game`, { withCredentials: true });
            setGames(gamesResponse.data);
          } catch (error) {
            console.log("Erreur lors de la récupération des jeux :", error);
          }
        };

        fetchGames();
    } catch (error) {
      if (params.username) {
        console.error("Erreur lors de la récupération de l'utilisateur dans params :", error);
      } else {
        console.log("Erreur lors de la récupération de l'utilisateur :", error);
      }
    }
  };

  fetchUser();
}, [params.username]);

  return (
    <AuthGuard>
    <Layout>
    <div className={styles.all}>
      <div className={styles.all_score}>
        <div className={styles.all_score_avatar}>
        <div className={styles.all_score_ladder_logo}>
        <img src='../images/lvl2.png' alt="" className={styles.all_score_ladder_logo_img} />
        <div className={styles.all_score_ladder_logo_rank}>
          {user?.rank}
        </div>
        </div>
          <Avatar
		  alt="Remy Sharp"
		  src={user?.imageUrl}
          sx={{
            "@media screen and (width < 1500px)":{
              width:'70px',
              height:'70px',
              marginLeft:'0',
            },
            "@media screen and (width < 1000px)":{
              width:'40px',
              height:'40px',
              marginLeft:'0',
              marginRight:'0',
            },
            width: '80px',
            height: '80px',
            marginLeft: '0',
            marginRight:'0',
			      cursor:'pointer',
          }} />


          <div className={styles.blaze}>

		  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
        <div className="username" style={{marginLeft:'10px'}}>
          {user?.username}
        </div>
          </div>

          </div>

          <Typography variant="h6" gutterBottom sx={{
            "@media screen and (width < 1000px)":{
              fontSize:'12px',
              // margin:'10px',
            },
            "@media screen and (width < 1500px) and (width > 1000px)":{
              fontSize:'16px',
            },
            margin:'0',
            color:'white',
          }}>
             {/* <Title2fa/> */}
          </Typography>
        </div>


        <div className={styles.all_score_score} >
          <div className={styles.all_score_score_date}>

          </div>
          <div className={styles.all_score_score_stats}>
				{user && <ScoreInfo games={games} userId={user.id } rank={user.rank} />}
          </div>
        </div>
      </div>
    </div>
    </Layout>
    </AuthGuard>
  )
}

export default ProfilUsername
