'use client'
import React from 'react';
import styles from '../game.module.css';
import Layout from 'src/component/Layout';
import Game from 'src/component/play/game/Game';
import { AuthGuard } from 'src/api/HOC';

interface pageProps {
  params: { gameid: string }
}

const DashboardGameID: React.FC<pageProps> = ({ params }) => {
  return (
    <AuthGuard>
      <Layout>
        <div className={styles.all}>
          <div className={styles.all_game}>
            <Game gameID={params.gameid} />
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}

export default DashboardGameID;
