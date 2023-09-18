"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import styles from './backdrop.module.css';
import FullChannel from './FullChannel';
import EnterText from './EnterText';
import TextSend from './TextSend';
import { useEffect, useState, useRef, useContext } from 'react';
import { ChatContext, Message } from './ChatContext';
import { FriendsOnline } from './FriendsOnline';
import io, { Socket } from 'socket.io-client';
import { current } from '@reduxjs/toolkit';
import { BottomNavigation } from '@mui/material';
import { log } from 'console';
import { MenuCC } from './MenuCC';
import axios from 'axios';
import { Channel } from './ChatContext'


type Anchor = 'right';

interface User {
  id: number;
  username: string;
  imageUrl: string;
  friends: number[];
  blocked: number[];
  // Ajoutez d'autres champs nécessaires ici
}

export default function Backdrop() {
  const [state, setState] = useState<{ right: boolean }>({ right: false });
  const [messages, setMessages] = useState<Message[]>([]);
//   const socketRef = useRef<Socket | null>(null);
  const [latestChannel, setLatestChannel] = useState<Channel | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedchannel, setSearchedChannel] = useState<Channel | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [ownerId, setOwnerId] = useState<Channel| null>(null);
  const [userOwnerId, setUserOwnerId] = useState<User | null>(null);
  const chatSocketRef = useRef<Socket | null>(null);
  const channelSocketRef = useRef<Socket | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<number[]>([]);
  const [messageUpdate, setMessageUpdate] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;



  // ====================================== User actuel recuperation =======================================
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
// ====================================== Channel recherche par l utilisateur =======================================
useEffect(() => {
  const fetchSearchedChannel = async () => {
	if(searchedchannel === null){
		console.log('Aucun channel')
		return;
	}
    if (searchedchannel !== null) { // Assurez-vous que searchedchannel n'est pas null
		try {
        const response = await axios.get<Channel, any>(`${apiUrl}/channels/${searchedchannel.name}`, { withCredentials: true });
		if (response.status === 404) {
			console.log('Channel non trouvé');
		}
        setSearchedChannel(response.data);
        setIsLoading(false);
		if(response.data.banned.includes(user?.id))
		{
			setSelectedChannel(null);
		}
      } catch (error) {
        console.error('Erreur lors de la récupération du canal recherché :', error);
        setIsLoading(false);
      }
    }
  };

  fetchSearchedChannel();
}, [searchedchannel]);  // Les effets se déclencheront chaque fois que searchedchannel changera


useEffect(() => {
	async function fetchBlockedUsers() {
		if (!user?.id) {
			console.log('User ID is not defined');
			return;
		}
		console.log('Fetching blocked users for User ID:', user.id);
	  try {
		const response = await axios.get(`${apiUrl}/users/${user?.id}/blocked`, { withCredentials: true });
		console.log('Response received blockedUsers:', response.data);
		setBlockedUsers(response.data);
	  }catch (error) {
			console.error('Error fetching blocked users:', error);
		}
		}

	fetchBlockedUsers();
  }, [messageUpdate]);
  

useEffect(() => {
	if(!user || !user.id){
		console.log('pas de user')
		return;
	}
	const chatSocket = io(`${apiUrl}/chat`, {
		query: { socketType: 'chat',  userId: user?.id},
		reconnection: false
	});
	const channelSocket = io(`${apiUrl}/channel`, {
		 query: { socketType: 'channel' },
		 reconnection: false
		});


	chatSocketRef.current = chatSocket;
	channelSocketRef.current = channelSocket;
// Récupérez cet ID à partir de votre authentification/état utilisateur
  	chatSocket.emit('authenticate', user?.id);

	chatSocket.on('chat message', (message: Message) => {
		setMessageUpdate(prev => prev + 1);
	  // Vérifier si l'utilisateur est toujours membre du channel
	  console.log('message.sender ===> '+message)

	  if (selectedChannel) {
		console.log('chat message ===>'+message.message)
		setMessages((prevMessage) => [...prevMessage, message]);
	  }
	});

	chatSocket.on('DM', (message: Message) => {
		setMessageUpdate(prev => prev + 1);
		console.log('Direct Message received:', message);
	
		// Traitement du message DM comme vous le souhaitez.
		if (selectedChannel) {
			console.log('DM message ===>'+message.message)
			setMessages((prevMessage) => [...prevMessage, message]);
		  }
	});

	chatSocket.on('inv', (message: Message) => {
		setMessageUpdate(prev => prev + 1);
		console.log('Direct Message received:', message);
	
		// Traitement du message DM comme vous le souhaitez.
		if (selectedChannel) {
			console.log('DM message ===>'+message.message)
			setMessages((prevMessage) => [...prevMessage, message]);
		  }
	});

	chatSocket.on('chat complet', (messages: Message[]) => {
		setMessageUpdate(prev => prev + 1);
		console.log('Blocked Users:', blockedUsers); // Afficher les utilisateurs bloqués
		console.log('Incoming Messages:', messages);
		 // Afficher tous les messages entrants

		// Filtrez les messages et imprimez des informations de débogage pour chaque message
		let filteredMessages = messages.filter(message => !blockedUsers.includes(message.sender));
		console.log('Filtered Messages:', filteredMessages);
		setMessages(filteredMessages);

	});


	channelSocket.on('userBanned', function(data) {
		console.log("userBanned data", data);
		console.log(`${data.bannerUser} has banned ${data.bannedUser} from ${data.channel}`);

		// Mettez à jour l'interface utilisateur en conséquence...
		// Si le user banni est l'utilisateur actuel, le rediriger vers une autre page.
		if (data.bannedUser === user?.id) {
		  console.log('You are banned!');
		  setSelectedChannel(null)
		  // Redirect or update UI here...
		}
	});
	channelSocket.on('userKicked', function(data) {
		console.log("userKicked data", data);
		console.log(`${data.kickedUser} has kick ${data.kickedUser} from ${data.channel}`);

		// Mettez à jour l'interface utilisateur en conséquence...
		// Si le user banni est l'utilisateur actuel, le rediriger vers une autre page.
		if (data.kickedUser === user?.id) {
		  console.log('You have been kick!');
		  setSelectedChannel(null)
		  // Redirect or update UI here...
		}
	});

	return () => {
		chatSocketRef.current?.off('chat message');
		chatSocketRef.current?.off('DM');
		chatSocketRef.current?.off('chat complet');
		chatSocketRef.current?.off('userBanned');
		chatSocketRef.current?.off('userKicked');
		chatSocketRef.current?.disconnect();
		channelSocketRef.current?.disconnect();
		chatSocket.disconnect();
		channelSocket.disconnect();
	};
}, [selectedChannel,user]);

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

	// ====================================== Autocomplete for @ =======================================

const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;

  let usersData: { id: number; username: string }[] = [];

  if (value.startsWith('@')) {
    try {
      const response = await axios.get(`${apiUrl}/users/username/id`);
      usersData = response.data;

      const filteredUsernames = usersData.map(user => user.username)
        .filter(username => username.toLowerCase().startsWith(value.substring(1).toLowerCase()));

      setAutocompleteOptions(filteredUsernames);
    } catch (error) {
      console.error('Erreur lors de la récupération des usernames', error);
    }
  } else {
    setAutocompleteOptions([]);
  }

  setInputValue(value);

  	// =============================== ADMIN =================================\\

	const usernameToSetAdmin = value.substring(1, value.indexOf('/setadmin')).trim();
	const userIdToSetAdmin = usersData.find(user => user.username === usernameToSetAdmin)?.id;

	if (userIdToSetAdmin && selectedChannel) {

	  const responseGet = await axios.get(`${apiUrl}/channels/${selectedChannel?.name}`);
	  const currentAdmins = responseGet.data.admins; // Assurez-vous que c'est le bon chemin pour accéder à la liste des administrateurs
	  const currentOwner = responseGet.data.owner;
	  const currentMenber = responseGet.data.members;
		// Vérifie si l'utilisateur que l on veut promot admin est membre du channel
	  if (!currentMenber.includes(userIdToSetAdmin)) {
		console.error("Erreur : L'utilisateur doit etre membre du channel pour devenir admin");
		return;
	  }
	  // Vérifie si l'utilisateur actuel est un administrateur
	  if (currentAdmins.includes(userIdToSetAdmin)) {
		console.error("Erreur : L'utilisateur est deja admin");
		return;
	  }
	  // Vérifie si l'utilisateur actuel est owner
	  if(!currentOwner.includes(user?.id)){
		console.error("Erreur : vous n avais pas le droit de promote un user to admin")
		return;
	}
	  // Ajouter le nouvel administrateur à la liste
	  const updatedAdmins = [...currentAdmins, userIdToSetAdmin];
	  try {
		const response = await axios.put(`${apiUrl}/channels/${selectedChannel?.name}/admins`, {
		  admins: updatedAdmins, /// <===== Salope
		});

		if (response.status === 200) {
		  console.log(`L\'utilisateur ${user?.username} a promu ${usernameToSetAdmin} en tant qu'administrateur du channel ${selectedChannel?.name}`);
		} else {
		  console.error('Erreur lors de l\'attribution du rôle d\'admin');
		}
	  } catch (error) {
		console.error('Erreur lors de l\'attribution du rôle d\'admin', error);
	  }
	}
	// =============================== BAN =================================\\
	const usernameToBan = value.substring(1, value.indexOf('/ban')).trim();
	const userIdToBan = usersData.find(user => user.username === usernameToBan)?.id;

	if (userIdToBan && value.includes('/ban') && selectedChannel) {
	  const responseGet = await axios.get(`${apiUrl}/channels/${selectedChannel?.name}`);
	  const currentAdmins = responseGet.data.admins; // Assurez-vous que c'est le bon chemin pour accéder à la liste des administrateurs
	  const currentOwner = responseGet.data.owner;
	  const currentMenber = responseGet.data.members;
	  const currentBanned = responseGet.data.banned;
		// Vérifie si l'utilisateur que l on veut bannir est membre du channel
	  if (!currentMenber.includes(userIdToBan)) {
		console.error("Erreur : L'utilisateur doit etre membre du channel pour le bannir");
		return;
	  }
	//   // Vérifie si l'utilisateur actuel est un administrateur
	  if (!currentAdmins.includes(user?.id)) {
		console.error("Erreur : vous devez être un administrateur pour bannir un utilisateur");
		return;
	  }
	//   // Vérifie si l'utilisateur à bannir est le propriétaire du channel
	  if (currentOwner.includes(userIdToBan)) {
		console.error("Erreur : Vous ne pouvez pas bannir le propriétaire du channel");
		return;
	  }
	//   const updatedbanned = [...bannedUsers, userIdToBan];
	  // Bannir l'utilisateur
	  try {
		const response = await axios.put(`${apiUrl}/channels/${selectedChannel?.name}/ban`, {
		  banned: userIdToBan,
		  banneur: user?.id
		});

		if (response.status === 200) {
		  console.log(`L\'utilisateur ${user?.username} a banni ${usernameToBan} du channel ${selectedChannel?.name}`);
		} else {
		  console.error('Erreur lors du bannissement de l\'utilisateur');
		}
	  } catch (error) {
		console.error('Erreur lors du bannissement de l\'utilisateur', error);
	  }
	}
	// =============================== KICK =================================\\
	const usernameToKick = value.substring(1, value.indexOf('/kick')).trim();
	const userIdToKick = usersData.find(user => user.username === usernameToKick)?.id;

	if (userIdToKick && selectedChannel) {
  	const responseGet = await axios.get(`${apiUrl}/channels/${selectedChannel?.name}`);
  	const currentAdmins = responseGet.data.admins; // Assurez-vous que c'est le bon chemin pour accéder à la liste des administrateurs
  	const currentOwner = responseGet.data.owner;
  	const currentMembers = responseGet.data.members;

  	// Vérifie si l'utilisateur que l'on veut kicker est membre du channel
  	if (!currentMembers.includes(userIdToKick)) {
    	console.error("Erreur : L'utilisateur doit etre membre du channel pour être kické");
    	return;
  	}
  	// Vérifie si l'utilisateur actuel est un administrateur
  	if (!currentAdmins.includes(user?.id)) {
    	console.error("Erreur : vous devez être un administrateur pour kicker un utilisateur");
    	return;
  	}
  // Vérifie si l'utilisateur à kicker est le propriétaire du channel
  	if (currentOwner.includes(userIdToKick)) {
    	console.error("Erreur : Vous ne pouvez pas kicker le propriétaire du channel");
    	return;
  	}
  	// Kicker l'utilisateur
  	try {


    	const response = await axios.put(`${apiUrl}/channels/${selectedChannel?.name}/kick`, {
			idToKick: userIdToKick,
			kickerId: user?.id,
    	});
		if (selectedChannel && !selectedChannel.members.includes(user?.id)) {
			setSelectedChannel(null); // L'utilisateur n'est plus membre, on définit selectedChannel à null
			console.log('fais chier' + selectedChannel)
		  }

    if (response.status === 200) {
      console.log(`L\'utilisateur ${user?.username} a kické ${usernameToKick} du channel ${selectedChannel?.name}`);
    } else {
      console.error('Erreur lors du kick de l\'utilisateur');
    }
  } catch (error) {
    console.error('Erreur lors du kick de l\'utilisateur', error);
  }
}

	// =============================== MUTE =================================\\
const usernameToMute = value.substring(1, value.indexOf('/mute')).trim();
const userIdToMute = usersData.find((user) => user.username === usernameToMute)?.id;

if (userIdToMute && selectedChannel) {
  const responseGet = await axios.get(`${apiUrl}/channels/${selectedChannel?.name}`);
  const currentAdmins = responseGet.data.admins;
  const currentOwner = responseGet.data.owner;
  const currentMembers = responseGet.data.members;


  // Vérifie si l'utilisateur que l'on veut muter est membre du channel
  if (!currentMembers.includes(userIdToMute)) {
    console.error("Erreur : L'utilisateur doit être membre du channel pour être muté");
    return;
  }

  // Vérifie si l'utilisateur actuel est un administrateur
  if (!currentAdmins.includes(user?.id)) {
    console.error("Erreur : vous devez être un administrateur pour muter un utilisateur");
    return;
  }

  // Vérifie si l'utilisateur à muter est le propriétaire du channel
  if (currentOwner.includes(userIdToMute)) {
    console.error("Erreur : Vous ne pouvez pas muter le propriétaire du channel");
    return;
  }

  // Muter l'utilisateur avec une durée de 1 minute
  try {
    const response = await axios.put(`${apiUrl}/channels/${selectedChannel?.name}/mute`, {
      muted: userIdToMute,
      muteur: user?.id,
      mutedDuration: 1, // Durée du mute en minutes (automatiquement définie à 1 minute)
    });

    if (response.status === 200) {
      console.log(`L\'utilisateur ${user?.username} a muté ${usernameToMute} dans le salon ${selectedChannel?.name}`);
    } else {
      console.error("Erreur lors du mute de l'utilisateur");
    }
  } catch (error) {
    console.error("Erreur lors du mute de l'utilisateur", error);
  }
}
// =============================== FOLLOW =================================\\
const usernameToFollow = value.substring(1, value.indexOf('/addfriend')).trim();
const userIdToFollow = usersData.find(user => user.username === usernameToFollow)?.id;

if (userIdToFollow === null || userIdToFollow === undefined) {
} else {
  // Vérifier si l'id de l'utilisateur à ajouter n'est pas déjà en ami
  if (user?.friends.includes(userIdToFollow)) {
    console.log('L\'utilisateur est déjà en ami.');
    return; // Pas besoin de faire le reste du traitement s'il est déjà en ami
  }

  try {
    const response = await axios.put(`${apiUrl}/users/${user?.id}/friends`, {
      friendId: userIdToFollow
    });
    if (response.status === 200) {
      console.log(`L\'utilisateur ${user?.username} a ajouté ${usernameToFollow} en ami`);
    } else {
      console.error('Erreur lors de l\'ajout de l\'utilisateur en ami');
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur en ami', error);
  }
}


// =============================== BLOCKED =================================\\
const usernameToBlock = value.substring(1, value.indexOf('/block')).trim();
const userIdToBlock = usersData.find(user => user.username === usernameToBlock)?.id;

if (userIdToBlock === null || userIdToBlock === undefined) {
} else {
	if (user?.blocked.includes(userIdToBlock)) {
		console.log('L\'utilisateur est déjà bloqué.');
		return;
	  }
  try {
    const response = await axios.put(`${apiUrl}/users/${user?.id}/blocked`, {
      blockedId: userIdToBlock,
    });
    if (response.status === 200) {
		console.log(`L\'utilisateur ${user?.username} a bloqué ${usernameToBlock}`)
    } else {
      console.error('Erreur lors de l\'ajout de l\'utilisateur en bloqué');
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur en bloqué', error);
  }
  setMessageUpdate(prev => prev + 1);
}
}


  const handleAutocompleteClick = (username : string) => {
		// Met à jour la valeur du champ de saisie avec le nom sélectionné (en ajoutant "@" au début)
		setInputValue(`@${username}`);
		setAutocompleteOptions([]); // Réinitialise la liste des suggestions
	  };

	  return (
		<ChatContext.Provider value={{ messages, setMessages ,user:null ,refreshKey, setRefreshKey, searchedchannel:null, setSearchedChannel, selectedChannel, setSelectedChannel }}>
		  <div>
			{(['right'] as const).map((anchor) => (
			  <React.Fragment key={anchor}>
				<Button
				  onClick={toggleDrawer(anchor, true)}
				  sx={{
					marginLeft: '-20%',
					fontSize: '12px',
					fontWeight: '600',
					color: '#ffffff6b',
					'@media screen and (width < 1000px)': {
					  fontSize: '8px',
					  marginLeft: '-35%',
					  marginTop: '5%',
					},
					'&:hover': {
					  color: '#f0f8ff',
					},
				  }}
				>
				  CHAT
				</Button>
				<SwipeableDrawer
				  anchor={anchor}
				  open={state[anchor]}
				  onClose={toggleDrawer(anchor, false)}
				  onOpen={toggleDrawer(anchor, true)}
				  sx={{ height:'100vh'}}
				>
				  <div className={styles.inside_chat}>
					<FriendsOnline />
					<div className={styles.channel_tchat}>
					  <div className={styles.title}>
						<FullChannel />
					  </div>
					  <div className={styles.tchat}>
						<div className={styles.textsendermodule}>
						{messages.filter(message => Number(message.channelId) === selectedChannel?.id).map((message) => (
						<TextSend
						  key={message.id}
						  message={message}
						  // user={message.user}
						  // id={message.id}
							/>
						  ))}
						</div>
					  </div>
					  <div className={styles.enter_text}>
					  {autocompleteOptions.map((option) => (
								<div key={option}
									onClick={() => handleAutocompleteClick(option)}
									>
									{option}
								  </div>
								  ))}
								<input
								type="text"
								value={inputValue}
								onChange={handleInputChange}
									/>
								{/* Suggestions */}

							  </div>
					  {chatSocketRef.current ? (
						<EnterText socket={chatSocketRef.current}/>
					  ) : null}
					</div>
				  </div>
				</SwipeableDrawer>
			  </React.Fragment>
			))}
		  </div>
		</ChatContext.Provider>
	  );
}