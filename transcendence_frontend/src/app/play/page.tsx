'use client'
import React, { useState } from 'react'
import styles from './play.module.css'
import Layout from 'src/component/Layout'
import PlayButton from 'src/component/play/Play'
import { AuthGuard } from 'src/api/HOC'

const Play: React.FC = () => { 
    return (
        <AuthGuard>
        <Layout>
        <div className={styles.all}>
            <div className={styles.all_game}>
                    <PlayButton />     
            </div>
        </div>
        </Layout>
        </AuthGuard>
    )
}

export default Play