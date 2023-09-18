'use client';
import React, { useEffect, useState, useRef, useCallback, ChangeEvent } from 'react';
import styles from './login.module.css';
import { Avatar, Box, Button, Stack, TextField } from '@mui/material';
import Link from 'next/link';
import Particles from 'react-tsparticles';
import { Engine } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';
import particlesOptions from '../particles.json';
import { ISourceOptions } from 'tsparticles-engine';
import axios from 'axios';
import { fetchUser } from '../../api/api';
import Cookies from 'js-cookie';
import { AuthGuard } from 'src/api/HOC';
import Page2FA from './page2fa';

interface User {
  id: number;
  username: string;
  imageUrl: string;
  twoFactorEnabled: boolean;
  // Ajoutez d'autres champs nécessaires ici
}

const Profil: React.FC = () => {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUsernameValid, setIsUsernameValid] = useState(true); // Nouvelle variable d'état
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false); // Nouvelle variable d'état
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const getUser = async () => {
      const userData = await fetchUser();
      setUser(userData);
      setIsLoading(false);
    };

    getUser();
  }, []);

  useEffect(() => {
    const token = Cookies.get('jwt'); // Remplacez 'token' par le nom de votre cookie
    console.log('token => ' + token);
    if (!token) {
      // window.location.href = '/';
      console.log('pas de token');
    }
  }, []);

  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // if (isLoading) {
  //   return <div>vous n etes pas connecte</div>; // Retourner un composant de chargement
  // }


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

    setIsUpdatingUsername(true);
    try {
      const updateResponse = await axios.put(
        `${apiUrl}/user/${user?.id}/username`,
        { username },
        { withCredentials: true }
      );
      if (user) {
        setUser((prevUser) => ({
          ...prevUser,
          id: prevUser?.id ?? 0,
          imageUrl: prevUser?.imageUrl ?? '',
          username: updateResponse.data.username,
          twoFactorEnabled: prevUser?.twoFactorEnabled ?? false,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pseudo :', error);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  return (
    <AuthGuard>
        {user?.twoFactorEnabled ? (
        <Page2FA />
      ) : (
    <div className={styles.profil}>
      <Stack direction="column" className={styles.profil_in}>
        <Stack
          direction="column"
          spacing={3}
          className={styles.profil_in2}
          sx={{
            gap: '0%',
          }}
        >
          <div className={styles.profil_in2_title}>
            {user?.imageUrl && (
              <Avatar
                alt="Kevin"
                src={user?.imageUrl}
                sx={{
                  '@media screen and (width < 1500px)': {
                    width: '80px',
                    height: '80px',
                  },
                  backgroundColor: 'white',
                  width: '90px',
                  height: '90px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  handleAvatarClick();
                  updateProfilePicture();
                }}
              />
            )}

            <div className="profil_in_name">
              <p
                className="profil_in_name_text"
                style={{ fontSize: '20px', marginTop: '15%' }}
              >
                {user?.username}
              </p>
            </div>
          </div>
          <div>
            <TextField
              label="username"
              type="text"
              margin="none"
              value={username}
              onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                setUsername(event.target.value);
                await checkUsername(event.target.value);
              }}
              InputLabelProps={{
                style: { color: 'white' },
              }}
              inputProps={{
                style: { color: 'white' },
              }}
              sx={{
                '@media screen and (width < 1500px)': {
                  width: 220,
                },
                '.css-x2l1vy-MuiInputBase-root-MuiOutlinedInput-root': {
                  color: 'white',
                },
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
              size="medium"
              variant="outlined"
              fullWidth
            />
          </div>
          <Link href={isUsernameValid && !isUpdatingUsername ? "/intro" : "#"} passHref>
            <div
            className={styles.profile_in2_button}
              onClick={isUsernameValid ? updateUsername : undefined}
            >
            START
            </div>
          </Link>
        </Stack>
      </Stack>
      <Particles options={particlesOptions as ISourceOptions} init={particlesInit} />
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
        ref={fileInputRef}
      />
    </div>
      )}
    </AuthGuard>
  );
};

export default Profil;

