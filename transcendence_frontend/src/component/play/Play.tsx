import React, { useState, useEffect } from 'react';
import { GameModeContext } from './GameModeContext';
import styles from './playbutton.module.css';
import GlowButton from './Button';
import Link from 'next/link';
import Game from './game/Game';


const PlayButton: React.FC = () => {
  const [gameMode, setGameMode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedGameMode = localStorage.getItem('gameMode');
      return storedGameMode ? storedGameMode : null;
    }
    return null;
  });
  const [startGame, setStartGame] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameMode', gameMode || 'default');
    }
  }, [gameMode]);

  const selectGameMode = (mode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameMode', mode);
      setGameMode(localStorage.getItem('gameMode'));
    }
    console.log('Selected game mode:', mode);
  };

  const handleClick = () => {
    setStartGame(true);
  };

  return (
    <GameModeContext.Provider value={gameMode}>
      <div className={styles.all}>
        <div className={styles.play}>
          {startGame ? (
            <Game />
          ) : (
            <>
              <div className={styles.photo}>
                <div className={styles.left}>
                  <img src="./images/1r.png" className={styles.imageLeft} onClick={() => selectGameMode('normal')} />
                  <text className={styles.normal}>NORMAL</text>
                  </div>
                 <div className={styles.right}>
                  <img src="./images/boost.png" className={styles.imageRight} onClick={() => selectGameMode('boost')} />
                  <text className={styles.boost}>BOOST</text>
                </div>
              </div>
              {gameMode && <GlowButton onClick={handleClick} />}
            </>
          )}
        </div>
      </div>
    </GameModeContext.Provider>
  );
};

export default PlayButton;