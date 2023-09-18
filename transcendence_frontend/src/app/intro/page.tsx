'use client'
import React from 'react'
import EastIcon from '@mui/icons-material/East';
import Link from 'next/link';
import styles from './intro.module.css'
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import particlesOptions from "../particles.json";
import { ISourceOptions } from "tsparticles-engine";
import { useCallback } from 'react';
import { AuthGuard } from 'src/api/HOC';

const Intro: React.FC = () => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);
  return (
    <AuthGuard>
    <div className={styles.alli}>
        <div className={styles.alli_r}>
            <Link className={styles.button_next} href='/play' style={{textDecoration:'none'}}>
                <div className={styles.button_next_t}>
                    Passer l'introduction
                </div>
                <EastIcon fontSize='large'/>
            </Link>
            <div style={{ overflow: 'hidden', position: 'absolute', left: 10, top: 50, width: 50, height: 50 }}>
                <div className={styles.all_movie} style={{marginTop:'-290px'}}>
                    <object width="420" height="315">
                        {/* <param name="movie" value="https://www.youtube.com/v/EjMNNpIksaI?version=3&amp;hl=en_US&autoplay=1&amp;autohide=2"></param>
                        <param name="allowFullScreen" value="true"></param>
                        <param name="allowscriptaccess" value="always"></param> */}
                        <iframe width="420" height="315" 
                        src="https://www.youtube.com/embed/EjMNNpIksaI?autoplay=0" 
                        frameBorder="0" allow="pause; fullscreen" allowFullScreen></iframe>
                    </object>
                </div>
            </div>
            <p className={styles.start}>Il y a peu de temps, dans un navigateur pas si lointain que ça...&hellip;</p>
            <h1 className={styles.title}>PONG</h1>
            <div className={styles.titles}>
                <div className={styles.titlecontent}>
                <p className="center">EPISODE 3<br/>
                  LA REVANCHE DU SITE </p>
                <p className='p'>C'est dans une période troublée que deux joueurs s'affrontent sur une table de ping pong.</p>
                <p className='p'>Deux joueurs légendaires disposant chacun de la puissance exponentielle de la fameuse arme intergalactique, autrement nommée : Raquette de Ping Pong.</p>
                <p className='p'>Ils se livrent une bataille sans merci pour le controle de la galaxie et que l'Etoile Noire, a.k.a la balle, ne s'écrase pas dans leur camp.</p>
                <p className='p'>A chaque fois que l'Etoile Noire s'écrase dans le camp d'un des joueurs, le lanceur gagne un point, symbole d'honneur et d'espoir pour les citoyens de la galaxie.</p>
                <p className='p'>Il a été défini selon le traité de Naboo que la bataille se finissait en 11 ou 21 points.</p>
                <p className='p'>Les joueurs se doivent de combattre jusqu'à ce que mort s'en suive ou que la bataille se finisse.</p>
                <p className='p'>Pour info, le pilote de l'Etoile Noire a bu un coup avant de prendre le volant et il rebondit contre les parois de la galaxie.</p>
                <p className="center">Que la force soit avec toi, Luc !</p>
                <p className='p'>Luc Hichote, rien a voir avec Luke Skywalker.</p>
                <p className='p'>Lucky Shot, t'as compris ???</p>
                <p className='p'>Et oui, c'est un jeu de mot de génie.</p>
                <p className='p'>Bon je te laisse, bisous.</p>
                </div>
            </div>
            <iframe style={{ visibility: "hidden" }} width={560} height={315} src="https://www.youtube.com/embed/1KAOq7XX2OY" frameBorder={0} allowFullScreen></iframe>
        </div>
        <Particles options={particlesOptions as ISourceOptions} init={particlesInit}/>
    </div>
    </AuthGuard>
  )
}
export default Intro