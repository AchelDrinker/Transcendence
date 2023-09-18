import Link from 'next/link'
import React from 'react'
import styles from './sidebar.module.css'
import Logo from '../logo/logo'
import Backdrop from '../backdrop/backdrop'
import Scene from './Scene'

const Sidebar: React.FC = () => {
    return (
        <div className={styles.cointainer}>
            <div className={styles.container_link}>
                <div className={styles.container_logo}>
                    {/* <Logo/> */}
                    <Scene/>
                </div>
                
                <Link href='/play'  style={{textDecoration: 'none'}} className={styles.container_link_text}>
                    <div className={styles.container_link_text_button}>

                    </div>
                    <span className={styles.container_link_text_t}>
                        GAME
                    </span>
                    
                </Link>
                <Link href={'/live'} style={{textDecoration: 'none'}} className={styles.container_link_text} >
                    <div className={styles.container_link_text_button}>
                        
                    </div>
                    <span className={styles.container_link_text_t}>
                        LIVE
                    </span>
                </Link>
                <Link href={'/profil'}  style={{textDecoration: 'none'}} className={styles.container_link_text}>
                    <div className={styles.container_link_text_button}>

                    </div>
                    <span className={styles.container_link_text_t}>
                        PROFIL
                    </span>
                </Link>
                <Link href={'/rules'} style={{textDecoration: 'none'}} className={styles.container_link_text}>
                    <div className={styles.container_link_text_button}>
                        
                        </div>
                    <span  className={styles.container_link_text_t}>
                        RULES
                    </span>
                </Link>
                <Link href={'/credits'} style={{textDecoration: 'none'}} className={styles.container_link_text} >
                    <div className={styles.container_link_text_button}>
                        
                    </div>
                    <span className={styles.container_link_text_t}>
                        CREDIT
                    </span>
                </Link>
                <div style={{textDecoration: 'none'}} className={styles.container_link_text} >
                    <div className={styles.container_link_text_button}>
                        
                    </div>
                        <span className={styles.container_link_text_t}>
                            <Backdrop/>
                        </span>
                    </div>
                </div>    
        </div>
    )
}
export default Sidebar