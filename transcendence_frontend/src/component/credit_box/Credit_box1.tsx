import React from 'react'
import styles from './Credit_box.module.css'
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Avatar } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

function Credit_box1() {
  return (
    <div className={styles.credit_box}>
        <div className={styles.credit_box_left}>
            <img className={styles.credit_box_left_photo} src='./images/hugo.jpeg'></img>
            <span className={styles.credit_box_left_name}>HUMARTIN</span>
            <span className={styles.credit_box_left_job}>FULL-STACK</span>
        </div>
        <div className={styles.credit_box_right}>
            <a className={styles.credit_box_right_icon} href="https://www.linkedin.com/in/hugomartineu/"><LinkedInIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://github.com/AchelDrinker"><GitHubIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://seoi.net/penint/"><InstagramIcon/></a>
            <a className={styles.credit_box_right_icon} href="https://seoi.net/penint/"><FacebookIcon/></a>
        </div>
    </div>
  )
}

export default Credit_box1