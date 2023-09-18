import axios, { AxiosError } from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from './ChatContext';
import bcrypt from 'bcryptjs';

interface MenuCCProps {
  handleClose: () => void;
}

interface User {
	id: number;
	username: string;
	imageUrl: string;
	// Ajoutez d'autres champs nécessaires ici
}

export const MenuCC: React.FC<MenuCCProps> = ({ handleClose }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isprivate, setIsPrivate] = useState(false);
  const [searchedchannel, setSearchedchannel] = useState('');
  const [searchedchannelPassword, setSearchedchannelPassword] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('setRefreshKey is undefined, please check your context provider');
  }
  const { setRefreshKey, setSearchedChannel, selectedChannel, setSelectedChannel } = context;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>(`${apiUrl}/user`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      }
    };
    fetchUser();
  }, []);


  async function handleCreateChannel(name: string, password?: string, userId?: number, isprivate?: boolean, ) {
    const members: number[] = [];
    const admins: number[] = [];
	const owner: number[] = [];
	try {
      // vérifie si le canal existe
      const response = await axios.get(`${apiUrl}/channels/${name}`);
      // if(response.status === 404)
      // {
      //   console.log('creation du channel')
      // }
      // Si aucune erreur 404 n'est renvoyée, cela signifie que le canal existe déjà
    } catch (error) {
      const axiosError = error as AxiosError;
      // Si une erreur 404 est renvoyée, cela signifie que le canal n'existe pas et peut être créé
      if (axiosError.response && axiosError.response.status === 404) {
        console.log("creation du channel")
        const response = await fetch(`${apiUrl}/channels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            password,
            userId,
            isprivate,
			      admins: [userId], // Ajoute l'ID de l'utilisateur à la liste des admins
         	  members: [userId],
			      owner: [userId], // Ajoute l'ID de l'utilisateur à la liste des membres
			      banned: [],
          }),
        });

        if (response.ok) {
          const channel = await response.json();
          handleClose(); // Fermer les div après la création du channel
          // setRefreshKey(Date.now());
          setSelectedChannel(channel);
        } else {
          console.error('Error creating channel:', response.statusText);
        }
      } else {
        console.error('Error checking if channel exists:', error);
      }
    }
  }






  async function updateChannelPasswordAndPrivateStatus(name: string, newPassword: string, newIsPrivate: boolean, userId?: number) {
    if (name.length > 0)
	{
	try {
    console.log(name)
      // Vérifie si le canal existe
      const response = await axios.get(`${apiUrl}/channels/${name}`);
      console.log('reponse ===>'+ response.data.owner )
      console.log(response.status)
      console.log(response.data)

      // Si le canal existe
      if (response.status === 200) {
        // Vérifie si l'utilisateur est le propriétaire du canal
        if (response.data.owner.includes(userId)) {
          // Si oui, met à jour le mot de passe et l'état isprivate
          const updateResponse = await axios.put(`${apiUrl}/channels/${name}`, {
            password: newPassword,
            isprivate: newIsPrivate,
          });

          if (updateResponse.status === 200) {
            console.log(`Password and private status for channel ${name} have been updated.`);
          } else {
            console.error('Error updating password and private status:', updateResponse.statusText);
          }
        } else {
          console.error('User is not the owner of the channel:', name);
        }
      } else {
        console.error('Channel does not exist:', name);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error checking if channel exists or updating password and private status:', axiosError);
    }
	handleClose();
  }
}


  const handleClickCreate = async () => {
    try {
      // Essayer de récupérer le canal)
      if(name){
		await handleCreateChannel(name, password, user?.id, isprivate);
        console.log('le channel est cree')
      }

      // Si le canal existe, mettre à jour le mot de passe et l'état isprivate
      await updateChannelPasswordAndPrivateStatus(name, password, isprivate, user?.id);
    } catch (error: any) {
      console.log ( 'rien')
    //  } else {
    //    console.error('Error creating or updating channel:', error.message);
      }
    };




  async function checkChannelExists(searchedchannel: string, userId?: number) {
	try {
	  const response = await axios.get(`${apiUrl}/channels/${searchedchannel}`);
	  if (response.data.name) {
		console.log(response.data);
		handleClose();

		if (response.data.members && !response.data.members.includes(userId)) {
		  const newMembers = [...response.data.members, userId];
		  await axios.put(`${apiUrl}/channels/${searchedchannel}/members`, {
			members: newMembers,
		  });
		  console.log(`Utilisateur avec l'ID ${userId} a rejoint le channel ${searchedchannel}`);
		} else {
		  console.log(`Utilisateur avec l'ID ${userId} est déjà membre du channel ${searchedchannel}`);
		}

		return response.data;
	  }
	} catch (error) {
	  const axiosError = error as AxiosError;
	  if (axiosError.response && axiosError.response.status === 404) {
		console.log("false");
	  } else {
		console.error('Erreur lors de la vérification de l\'existence du canal :', error);
	  }
	}
  }
  const handleClickSearch = async () => {
    const userId = user?.id;

    try {
      const response = await axios.get(`${apiUrl}/channels/${searchedchannel}`);
      if (response.data.banned && response.data.banned.includes(userId)) {
        console.log(`Utilisateur avec l'ID ${userId} est banni du channel ${searchedchannel}`);
        return;
      }

      const isPasswordValid = await bcrypt.compare(searchedchannelPassword, response.data.password);
      if (!isPasswordValid) {
        console.log(`Le mot de passe ne correspond pas à celui du canal`);
        return;
      }

      const channel = await checkChannelExists(searchedchannel, userId);
      if (channel) {
        setSelectedChannel(channel);
      } else {
        console.error('Canal recherché non trouvé:', searchedchannel);
      }
    } catch (error: any) {
      console.error('Erreur lors de la recherche du canal:', error.message);
    }
  };

const handleClickQuit = async () => {
  if (selectedChannel) {
    try {
      // Vérifier si l'utilisateur actuel est l'owner du canal
      const isOwner = selectedChannel.owner.includes(user?.id);
	//  console.log('isOwner ===>'+ isOwner);
	//  console.log('selectedChannel.name ===>'+ selectedChannel.name);

      // Appeler l'API pour quitter le canal (si l'utilisateur est l'owner)
      if (isOwner) {
        const response = await axios.delete(`${apiUrl}/channels/${selectedChannel.name}`);

        if (response.status === 200) {
          // Le canal a été supprimé avec succès, tu peux effectuer les actions nécessaires côté frontend
          setSelectedChannel(null);
          handleClose();
        } else {
          // Gérer les erreurs si besoin
		  setSelectedChannel(null);
		  handleClose();
        }
      } else {
        // L'utilisateur n'est pas l'owner, gère cette situation si nécessaire
		setSelectedChannel(null);
		handleClose();
      }
    } catch (error) {
      // Gérer les erreurs
	  setSelectedChannel(null);
	  handleClose();
    }
  } else {
    // Aucun canal sélectionné, gérer cette situation si nécessaire
	setSelectedChannel(null);
	handleClose();
  }
};



  return (
    <div className="container"
    style={{
        width:'75%',
        height:'180px',
        backgroundColor:'black',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
        position:'absolute',
        top:'77%',
        right:'10%',
        borderRadius:'15px',
    }}>
        <div className="inputs"
        style={{
            width:'100%',
            height:'100%',
            display:'flex',
            flexDirection:'column',
            alignItems:'flex-start',
            justifyContent:'center',
            gap:'10px',
            borderRadius:'20px',
            marginLeft:'10px',
        }}>
          <div className="input_channel" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Search a channel:</p>
                <input type="text"
                value={searchedchannel}
                onChange={(e) => setSearchedchannel(e.target.value)}
                style={{width:'130px', marginLeft:'10px'}}
                />
            </div>
            <div className="input_channel_password" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Channel password:</p>
                <input type="text"
                value={searchedchannelPassword}
                onChange={(e) => setSearchedchannelPassword(e.target.value)}
                style={{width:'130px', marginLeft:'10px'}}
                />
            </div>
            <p style={{color:'white'}}>======================</p>
            <div className="input_name" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Channel name:</p>
                <input type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{width:'130px', marginLeft:'10px'}}
                />
            </div>
            <div className="private" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color:'white', fontSize:'10px'}}>Private:</p>
                <input
                type="checkbox"
                style={{marginLeft:'10px'}}
                onChange={(e) => setIsPrivate(e.target.checked)}
                />
            </div>
            <div className="input_password" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
            <p style={{color:'white', fontSize:'10px'}}>Password:</p>
            <input type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{width:'130px', marginLeft:'10px'}}
            />
            </div>

        </div>
        <div className="button"
        style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          flexDirection:'column',
          width:'50%',
          height:'100%',
        }}
        >
        <button
        style={{
            width:'100%',
            height:'100%',
            borderRadius:'15px',

        }} onClick={handleClickSearch}>
            Join
        </button>
        <button
        style={{
            width:'100%',
            height:'100%',
            borderRadius:'15px',

        }} onClick={handleClickCreate}>
            Create
        </button>
        <button
        style={{
            width:'100%',
            height:'100%',
            borderRadius:'15px',

        }} onClick={handleClickQuit}>
            Quit
        </button>

        </div>
    </div>
  )
}