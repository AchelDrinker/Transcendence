'use client'
import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react'
import Layout from 'src/component/Layout'
import { Avatar, Box, Button, ButtonGroup, Switch, TextField, Typography, alpha, styled } from '@mui/material'
import { pink } from '@mui/material/colors';
import styles from './profil.module.css'
import ScoreInfo from 'src/component/scoreboard/ScoreInfoMiddle';
import axios from 'axios';
import { AuthGuard } from 'src/api/HOC';
import { fetchUser } from 'src/api/api';




const PinkSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: 'white',
    '&:hover': {
      backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
    },
    "@media screen and (width < 1000px)":{
      fontSize:'10px',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: 'white',
  },
}));

export interface User {
  id: number;
  username: string;
  imageUrl: string;
  twofactorEnabled: boolean;
  rank: number;
}

export interface Game {
  user1: User;
  user2: User;
  score: string;
  mode: string;
  date: string;
}

const Profil: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[] | null>(null);
  const [username, setUsername] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  

  useEffect(() => {
    const fetchUser = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const userResponse = await axios.get<User>(`${apiUrl}/user`, { withCredentials: true });
        setUser(userResponse.data);

        const fetchGames = async () => {
          try {
            const gamesResponse = await axios.get<Game[]>(`${apiUrl}/game`, { withCredentials: true  });
            setGames(gamesResponse.data);
          } catch (error) {
            console.log("Erreur lors de la récupération des jeux :", error);
          }
        };

        fetchGames();

      } catch (error) {
        console.log("Erreur lors de la récupération de l'utilisateur :", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
		const getUserAndUpdateInGame = async () => {
		  const userData = await fetchUser();
		  setUser(userData);
	
		  // Réinitialiser le statut inGame après avoir récupéré les informations de l'utilisateur
		  const userId = userData.id;
		  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	
		  try {
			await axios.put(`${apiUrl}/users/${userId}/inGame`, {}, { withCredentials: true });
			// Mettre à jour l'état local après avoir réinitialisé inGame
			setUser(prevUser => {
				if (prevUser) {
				  return { ...prevUser, inGame: false };
				}
				return null;
			  });
		  } catch (error) {
			console.error("Erreur lors de la mise à jour du statut inGame:", error);
		  }
		};
	
		getUserAndUpdateInGame();
	  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedImage(file);
    }
  };

  const updateProfilePicture = async () => {
    if (!selectedImage) return;

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.put<User>(
        `${apiUrl}/user/${user?.id}/image`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUser(response.data);
      console.log('resp data =>' + response.data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo de profil :', error);
    }
  };
  console.log('imgaurl en front => ' + user?.imageUrl);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const checkUsername = async (username: string) => {
	if (username.trim() === '') {
	  console.error('L\'username ne peut pas être vide');
	  setIsUsernameValid(false);
	  return;
	}

	try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	  const checkResponse = await axios.get(`${apiUrl}/user/exists/${username}`, { withCredentials: true });
	  if (checkResponse.data.exists) {
		console.error('Le nom d\'utilisateur est déjà pris');
		setIsUsernameValid(false);
	  } else {
		setIsUsernameValid(true);
	  }
	} catch (error) {
	  console.error('Erreur lors de la vérification du pseudo :', error);
	  setIsUsernameValid(false);
	}
  };

  const updateUsername = async () => {
	if (!isUsernameValid) {
	  console.error('Le nom d\'utilisateur n\'est pas valide');
	  return;
	}

	if (!username || username.trim() === '') {
	  console.error('Le nom d\'utilisateur ne peut pas être vide');
	  return;
	}

	setIsUpdatingUsername(true);
	try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	  const updateResponse = await axios.put(
      `${apiUrl}/user/${user?.id}/username`,
		{ username },
		{ withCredentials: true }
	  );

	  if (user) {
		setUser((prevUser) => ({
		  ...prevUser!,
		  id: updateResponse.data.id,
		  imageUrl: updateResponse.data.imageUrl,
		  username: updateResponse.data.username,
		  twofactorEnabled: updateResponse.data.twofactorEnabled,
		}));
	  }
	} catch (error) {
	  console.error('Erreur lors de la mise à jour du pseudo :', error);
	} finally {
	  setIsUpdatingUsername(false);
	}
  };

  // ===== 2FA =====

  const handle2FAButtonClick = () => {
	setIs2FAEnabled((prevValue) => !prevValue);
	push2fastatue();
  };
console.log('is2FAEnabled => ' + is2FAEnabled);

const push2fastatue = async () => {
try {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const response = await axios.put<User>(
  `${apiUrl}/users/${user?.id}/two-factor-enabled`,
{ twoFactorEnabled: is2FAEnabled },
{ withCredentials: true }
);

console.log('response => ' + response.data.twofactorEnabled);
} catch (error) {
console.error('Erreur lors de la mise à jour de l\'état de la 2FA :', error);
}
};




return (
  <AuthGuard>
    <Layout>
    <div className={styles.all}>
      <div className={styles.all_score}>
        <div className={styles.all_score_avatar}>
        <div className={styles.all_score_ladder_logo}>
        <img src='./images/lvl2.png' alt="" className={styles.all_score_ladder_logo_img} />
        <div className={styles.all_score_ladder_logo_rank}>
          {user?.rank}
        </div>
        </div>
          <Avatar
		  alt="Remy Sharp"
		  src={user?.imageUrl}
		  onClick={() => {
			handleAvatarClick();
			updateProfilePicture();
		  }}
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
        <div className="username">
          {user?.username}
        </div>
            <TextField
              label=''
              type="text"
              margin="none"
              onChange={async (e) => {
                setUsername(e.target.value);
                await checkUsername(e.target.value);
              }}
              InputLabelProps={{
                style: { color: 'white' },
              }}
              inputProps={{
                style: { color: 'white' },
              }}
              sx={{
                '@media screen and (width < 1500px)': {
                  width: 150,
                },
                '@media screen and (width < 1000px)': {
                  width: 100,
                  marginLeft:'10px',
                },
                '.css-x2l1vy-MuiInputBase-root-MuiOutlinedInput-root': {
                  color: 'white',
                },
                marginLeft:'20px',
                width:'200px'
              }}
              InputProps={{
                sx: {
                  '@media screen and (width < 1500px)': {
                    fontSize: '65%',
                  },
                  '.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
                    border: '2px solid white',
                  },
                  '&:hover': {
                    '.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
                      border: '2px solid white',
                    },
                  },
                },
              }}
              size="small"
              variant="outlined"
              fullWidth
            />
			<button className={styles.handleChangeUsername} onClick={isUsernameValid ? updateUsername : undefined} style={{cursor: 'pointer',}}>
				<h3> Update </h3>
			</button>
			<button className={styles.button_2fa} onClick={handle2FAButtonClick}>
              2FA
            </button>
          </div>

          </div>

          <Typography variant="h6" gutterBottom sx={{
            "@media screen and (width < 1000px)":{
              fontSize:'12px',
            },
            "@media screen and (width < 1500px) and (width > 1000px)":{
              fontSize:'16px',
            },
            margin:'0',
            color:'white',
          }}>

          </Typography>
        </div>


        <div className={styles.all_score_score} >
          <div className={styles.all_score_score_date}>
          </div>
          <div className={styles.all_score_score_stats}>
            {user && <ScoreInfo games={games} userId={user.id} rank={user.rank} />}
          </div>
        </div>
      </div>
    </div>
	<input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
        ref={fileInputRef}
      />
    </Layout>
    </AuthGuard>
  )
}

export default Profil