import { Avatar, AvatarGroup, Badge, styled } from '@mui/material'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import styles from './FO.module.css'
import axios from 'axios';
import { Tooltip } from '@mui/material';

type User = {
  username: string;
  imageUrl: string;
  id: number;
  isOnline: boolean;
  inGame: boolean;
  // ajouter ici d'autres propriétés selon les besoins
};

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));
  type Friend = {
    id: number;
    username:string;
    friends: number[];// ajouter ici d'autres propriétés si nécessaire
  };
  

export const FriendsOnline = () => {

  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>(`${apiUrl}/user`, { withCredentials: true });
        const currentUser = response.data;
        setUser(currentUser);

        const friendsResponse = await axios.get<Friend[]>(`${apiUrl}/users/${currentUser.id}/friends`, { withCredentials: true });
        const friendIds = friendsResponse.data.map((friend) => friend.id);

        const friendPromises = friendIds.map(id => axios.get<User>(`${apiUrl}/user/${id}`));
        const friendsDetailsResponses = await Promise.all(friendPromises);
        const friendsDetails = friendsDetailsResponses.map(response => response.data);

        const onlineStatusPromises = friendsDetails.map(friend => 
          axios.get<{ online: boolean }>(`${apiUrl}/users/${friend.id}/online-status`, { withCredentials: true })
        );

        const onlineStatusResponses = await Promise.all(onlineStatusPromises);
        //console.log("online status", JSON.stringify(onlineStatusResponses, null, 2));


        const friendsWithOnlineStatus = friendsDetails.map((friend, index) => ({
          ...friend,
          isOnline: onlineStatusResponses[index].data.online
          
        }));
        //console.log("friend with online", JSON.stringify(friendsWithOnlineStatus, null, 2));

        setFriends(friendsWithOnlineStatus);

      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur et des amis :", error);
      }
    };

    fetchUser();
  }, []);
  

  const [state, setState] = React.useState({
    right: false,
  });
  
  return (
    <div className={styles.channel}>
                <div className={styles.channel_photo}>
                <AvatarGroup max={4}>
                  {friends.map(friend =>(
                    <Tooltip  title={friend.isOnline ? (friend.inGame ? "En jeu" : "En ligne") : "Hors ligne"} key={friend.id}>
                  <Link href={`/profil/${friend.username}`}>
                  <Avatar 
                  alt={friend.username} 
                  src={friend.imageUrl} 
                  style={{ 
                    cursor:'pointer', 
                    borderColor: friend.isOnline ? '#44b700' : 'transparent', 
                    borderWidth: 2, 
                    borderStyle: 'solid' 
                  }}
                  />
                  </Link>
                </Tooltip>
                  ))}
                </AvatarGroup>
                </div>
                <div className={styles.channel_text}>
                    <h3>Friends Online</h3>
                </div>
                <div className={styles.channel_profil}>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  variant="dot"
                  >
                  <Link href="/profil">
                  <Avatar alt="Remy Sharp" src={user?.imageUrl} style={{cursor:'pointer'}}/>
                  </Link>
                </StyledBadge>
                </div>  
            </div>
  )
}
