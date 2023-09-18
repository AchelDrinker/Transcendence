Transcendence : 100/100 with 3 stars

# Projet ft_transcendence

Bienvenue sur le projet Transcendence ! Le classique jeu de Pong dans une expérience en ligne renouvelée, où les joueurs peuvent s'affronter, chatter en temps réel, et plus encore, le tout dans un environnement sécurisé et moderne.

## 📖 Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Sécurité](#sécurité)
- [Contributions](#contributions)

## 💻 Fonctionnalités

### **Vue d'ensemble**
- **Interface utilisateur intuitive** : Un site web single-page offrant une expérience fluide avec prise en charge des boutons Précédent et Suivant du navigateur.
- **Compatibilité multi-navigateurs** : Support de la dernière version stable de Google Chrome, de Firefox et de Safari.

### **Compte utilisateur**
- **Authentification OAuth Intranet 42** : Connexion sécurisée grâce à l'intégration d'Intranet 42 OAuth.
- **Personnalisation du profil** : Choisissez un nom d'utilisateur unique et téléchargez votre avatar.
- **Authentification à deux facteurs (2FA)** : Renforcez la sécurité de votre compte avec l'authentification 2FA via Google Authenticator ou SMS.
- **Amis et statut en ligne** : Ajoutez des amis et consultez leur statut en temps réel. (@username /addfriend)

### **Chat**
- **Salles de chat et messagerie directe** : Créez des salles de chat publiques, privées ou protégées par mot de passe et envoyez des messages directs aux autres utilisateurs.  (@username /DM)
- **Gestion des salles** : En tant que créateur d'une salle, gérez les paramètres de celle-ci et attribuez des rôles administratifs. (@username /setadmin)
- **Invitations au jeu** : Invitez d'autres à un jeu de Pong directement depuis l'interface de chat. (@username /inv)

### **Le jeu**
- **Jeu Pong authentique** : Jouez au Pong en respectant les règles du jeu original de 1972, avec des options de personnalisation additionnelles pour enrichir l'expérience de jeu.
- **Système de mise en relation** : Rejoignez une file d'attente pour être jumelé automatiquement à un autre joueur. Plusieurs jeux en même temps sont possibles.

## 🛠 Technologies utilisées

- **Backend** : NestJS
- **Frontend** : NextJS Typecript
- **Base de données** : PostgreSQL / Railway app
- **Déploiement** : Docker

## 🚀 Installation

Pour installer et lancer le projet, suivez les étapes ci-dessous :

1. **Clonez le dépôt** :

2. **Configuration des fichiers .env** :

Placez les fichiers .env dans les dossiers frontend et backend en suivant le schéma indiqué dans les READMEs respectifs de chaque dossier.

3. **Lancement de l'application** :

Assurez-vous d'avoir Docker installé sur votre système. Ensuite, ouvrez un terminal, naviguez vers le répertoire racine du projet et exécutez la commande suivante :

```
docker-compose up --build
```

## 🖥 Utilisation
Une fois le projet démarré, accédez-y en ouvrant votre navigateur web et en naviguant vers :

Au frontend via : http://IP_PC_LANCANT_LE_PROGRAMME:3000/
Au backend via : http://IP_PC_LANCANT_LE_PROGRAMME:4000/
La base de données PostgreSQL est accessible via votre application Railway sur https://railway.app/.

Remplacez "IP_PC_LANCANT_LE_PROGRAMME" par l'IP correspondante, le jeu est accessible par tous les appareils sur le réseau local.

## 🔒 Sécurité
Cryptage des mots de passe : Les mots de passe sont stockés de manière sécurisée grâce à un algorithme de hachage fort (bcrypt).
Protection contre les injections SQL : Le site est protégé contre les injections SQL grâce à une validation côté serveur robuste.
Gestion sécurisée des secrets : Toutes les informations sensibles sont stockées de manière sécurisée dans un fichier .env qui est ignoré par git.

## 🤝 Contributions
Si ce projet vous a aidé, merci de mettre une étoile !
