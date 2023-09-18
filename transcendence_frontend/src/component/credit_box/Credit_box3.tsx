import React from 'react'
import styles from './Credit_box.module.css'
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Avatar } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

function Credit_box3() {
  return (
    <div className={styles.credit_box}>
        <div className={styles.credit_box_left}>
		<img className={styles.credit_box_left_photo} src='./images/Nico.png'></img>
            <span className={styles.credit_box_left_name}>NBECHARD</span>
            <span className={styles.credit_box_left_job}>FRONT-END</span>
        </div>
        <div className={styles.credit_box_right}>
            <a className={styles.credit_box_right_icon} href="https://seoi.net/penint/"><LinkedInIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://seoi.net/penint/"><GitHubIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://seoi.net/penint/"><InstagramIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://seoi.net/penint/"><FacebookIcon/></a>
        </div>
    </div>
  )
}

export default Credit_box3