import React from 'react'
import styles from './Credit_box.module.css'
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Avatar } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import ReactLogo from '../3D/ReactLogo';

function Credit_box() {
  return (
    <div className={styles.credit_box}>
        <div className={styles.credit_box_left}>
            <img className={styles.credit_box_left_photo} src='./images/kev.png'></img>
           
            <span className={styles.credit_box_left_name}>KTHIERRY</span>
            <span className={styles.credit_box_left_job}>FULL-STACK</span>
        </div>
        <div className={styles.credit_box_right}>
           
            <a className={styles.credit_box_right_icon} href="https://www.linkedin.com/in/kevin-thierry-321695254/"><LinkedInIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://github.com/khasey"><GitHubIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://www.instagram.com/khaseymusic/?hl=fr"><InstagramIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://seoi.net/penint/"><FacebookIcon/></a>
        </div>
    </div>
  )
}

export default Credit_box