import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';

type User = {
  username: string;
  imageUrl: string;
  id: number;
  // ajouter ici d'autres propriétés selon les besoins
};

export type Channel = {
  owner: any;
  banned: any;
  muted: any;
  id: number;
  name: string;
  members: any;
  ownerId: string[];
  adminId: string[];
  bannedUsers: string[];
  kickedUser: string;
  mutedUsers: string[];
  muteEndTime: {[userId: string]: number};
  // Ajoutez ici d'autres champs si nécessaire
};


export interface Message {
  channelId: string;
  sender: number;
  message: ReactNode;
  id: string;
  text: string;
  user: Message;
  username: string;
  imageUrl: string;
}

interface ChatContextProps {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  user: User | null;
  refreshKey: number;  // Ajouter ces lignes
  setRefreshKey: Dispatch<SetStateAction<number>>; // Ajouter ces lignes
  searchedchannel: Channel | null; // Ajoutez ceci
  setSearchedChannel: Dispatch<SetStateAction<Channel | null>>;
  selectedChannel: Channel | null;
  setSelectedChannel: React.Dispatch<React.SetStateAction<Channel | null>>;
}

export const ChatContext = createContext<ChatContextProps | null>(null);

// Composant fournisseur du contexte
export const ChatContextProvider: React.FC<{ children: ReactNode; user : User|null }> = ({ children, user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Ajouter ces lignes
  const [searchedchannel, setSearchedChannel] = useState<Channel | null>(null); // Ajoutez ceci
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  // Fonction pour mettre à jour les messages avec les données du backend
  const updateMessages = (newMessages: Message[] | ((prevState: Message[]) => Message[])) => {
    setMessages(newMessages);
  };

  // Autres valeurs du contexte à fournir// Mettez à jour cette valeur avec les données de l'utilisateur

  const contextValue: ChatContextProps = {
    messages,
    setMessages: updateMessages,
    user,
    refreshKey, // Ajouter ces lignes
    setRefreshKey, // Ajouter ces lignes
    searchedchannel, // Ajoutez ceci
    setSearchedChannel, // Ajoutez ceci
    selectedChannel,
    setSelectedChannel,
  };

  console.log('user dans chatcontext'+user)
  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};
