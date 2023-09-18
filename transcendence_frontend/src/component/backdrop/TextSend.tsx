import React, { useContext } from 'react';
import styles from './TextSend.module.css';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Link from 'next/link';
import { ChatContext, Message } from './ChatContext';

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

interface TextSendProps {
  message: Message;
}

const TextSend: React.FC<TextSendProps> = ({ message }) => {
  const currentTime = new Date();
  const timeString = `${currentTime.getHours()}:${currentTime.getMinutes()}`;

  const chatContext = useContext(ChatContext);

  if (!chatContext) {
    throw new Error("Vous devez utiliser le contexte du chat à l'intérieur du fournisseur de chat");
  }

  const username = message?.username || "pas de blaze"; 

  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <Link href={`profil/${message.username}`}>
            <Avatar alt="Remy Sharp" src={message.imageUrl} />
          </Link>
        </StyledBadge>
      </div>
      <div className={styles.text}>
        <div className={styles.text_in}>
          <div className={styles.inner_name}>
          {username && <p>{message.username}</p>}
          </div>
          <div className={styles.inner_text}>
            <p>{message.message}</p>
          </div>
        </div>
        <div className={styles.time}>
          <p>{timeString}</p>
        </div>
      </div>
    </div>
  );
};

export default TextSend;
