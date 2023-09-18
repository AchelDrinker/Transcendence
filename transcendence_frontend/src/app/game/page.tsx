'use client'
import React from 'react'
import styles from './game.module.css'
import Layout from 'src/component/Layout'
import Game from 'src/component/play/game/Game'
import { AuthGuard } from 'src/api/HOC'

const Dashboard: React.FC = () => {
    return (
        <AuthGuard>
        <Layout>
        <div className={styles.all}>
            <div className={styles.all_game}>
                <Game/>
            </div>
        </div>
        </Layout>
        </AuthGuard>
    )
}

export default Dashboard