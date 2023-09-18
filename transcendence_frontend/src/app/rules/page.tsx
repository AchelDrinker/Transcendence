'use client'
import Layout from 'src/component/Layout'
import styles from './rules.module.css'
import { AuthGuard } from 'src/api/HOC'
import { useEffect, useState } from 'react'
import { fetchUser } from 'src/api/api'
import axios from 'axios'

interface User {
	id: number;
	username: string;
	imageUrl: string;
	twoFactorEnabled: boolean;
	isGame: boolean;
	// Ajoutez d'autres champs nécessaires ici
  }

const Rules:React.FC = () => {

	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const getUserAndUpdateInGame = async () => {
		  const userData = await fetchUser();
		  setUser(userData);
	
		  // Réinitialiser le statut inGame après avoir récupéré les informations de l'utilisateur
		  const userId = userData.id;
		  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	
		  try {
			await axios.put(`${apiUrl}/users/${userId}/inGame`, {}, { withCredentials: true });
			// Mettre à jour l'état local après avoir réinitialisé inGame
			setUser(prevUser => {
				if (prevUser) {
				  return { ...prevUser, inGame: false };
				}
				return null;
			  });
		  } catch (error) {
			console.error("Erreur lors de la mise à jour du statut inGame:", error);
		  }
		};
	
		getUserAndUpdateInGame();
	  }, []);

  return (
    <AuthGuard>
    <Layout>
      <div className={styles.all}>
        <div className={styles.all_rules}>
          <span className={styles.all_rules_title}>RULES</span>
          <div className={styles.all_rules_textRules}>
            <p > <span className={styles.gradientText}>Pong</span>  est un jeu vidéo classique qui simule un jeu de tennis de table en utilisant des graphismes simples.<br /><span className={styles.gradientText}> Voici les règles de base du jeu : </span> </p>
            <p >Deux joueurs s'affrontent, chacun contrôlant une raquette à l'écran. Le jeu commence avec une balle au milieu de l'écran.</p>
            <p >Les joueurs doivent faire rebondir la balle avec leur raquette pour l'envoyer vers le côté opposé de l'écran, et essayer de faire en sorte <br /> que l'adversaire ne puisse pas la renvoyer. <br /> Si un joueur manque la balle, l'autre joueur marque un point.</p>
            <p >Le premier joueur à atteindre 11 points remporte la partie.</p>
            <p > <span className={styles.gradientText}>Voici quelques règles supplémentaires qui peuvent varier selon les versions du jeu :</span></p>
            <p >La balle peut rebondir sur les murs de chaque côté de l'écran, mais pas sur les murs supérieur et inférieur. <br /> Les joueurs peuvent déplacer leur raquette verticalement le long de l'écran pour frapper la balle.</p>
            <p >La balle peut changer de direction et de vitesse après avoir été touchée par une raquette, ce qui peut rendre le jeu plus difficile. </p>
			<div className={styles.How2Play}>
				<span className={styles.gradientText2} > Comment jouer ?</span>
				<div className={styles.How2PlayContent}>
				<img className={styles.img} src="images/movepaddle.png" alt="img"/>
				<p className={styles.all_rules_textRules}>Déplacez votre raquette avec les touches <span className={styles.gradientText}>↑</span> et <span className={styles.gradientText}>↓</span> </p>
				</div>
			</div>
			<div className={styles.Mode}>
			<span className={styles.gradientText2} >Différents Modes :</span>
			<div className={styles.How2PlayMode}>
			<div className={styles.modeContainer}>
			<img className={styles.imgMode} src="images/normal.png" alt="img" />
			<div className={styles.modeText}>
    			<span className={styles.gradientText}>Mode Normal</span> <br/>
    			Aucun effet supplémentaire
			</div>
			</div>
			<div className={styles.modeContainer}>
			<img className={styles.imgMode} src="images/boost2.png" alt="img" />
			<div className={styles.modeText}>
    			<span className={styles.gradientText}>Mode Boost</span> <br/>
    			Vitesse de la balle multipliée par <span className={styles.gradientText}>3</span> !
			</div>
			</div>
			</div>
			</div>
          </div>
        </div>
      </div>
    </Layout>
    </AuthGuard>
  )
}

export default Rules
