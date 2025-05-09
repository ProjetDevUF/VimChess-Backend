# VimChess-Backend

## Description
VimChess-Backend est une API backend pour un jeu d'échecs en ligne, développée avec NestJS. Cette API permet aux utilisateurs de jouer aux échecs en temps réel via WebSocket, avec des fonctionnalités de matchmaking, de gestion de parties, et d'authentification.

## Technologies utilisées
- [NestJS](https://nestjs.com/) - Framework Node.js pour construire des applications serveur efficaces et évolutives
- [TypeScript](https://www.typescriptlang.org/) - Superset typé de JavaScript
- [Prisma](https://www.prisma.io/) - ORM pour Node.js et TypeScript
- [PostgreSQL](https://www.postgresql.org/) - Base de données relationnelle
- [Socket.IO](https://socket.io/) - Bibliothèque pour la communication en temps réel
- [JWT](https://jwt.io/) - JSON Web Tokens pour l'authentification
- [Docker](https://www.docker.com/) - Conteneurisation pour le développement et le déploiement

## Fonctionnalités
- **Authentification** - Inscription, connexion et gestion des utilisateurs
- **Jeu d'échecs en temps réel** - Communication WebSocket pour les mouvements et les mises à jour
- **Matchmaking** - Système de file d'attente pour associer les joueurs en fonction de leur niveau (ELO)
- **Gestion des parties** - Création, sauvegarde et chargement des parties
- **Système de rematch** - Possibilité de proposer et d'accepter des revanches
- **Chat en jeu** - Communication entre les joueurs pendant les parties

## Structure du projet
```
src/
├── common/
│   └── constants/
│       └── game/
│           └── Emit.Types.ts - Noms d'events WebSocket
├── module/
│   ├── auth/ - Module d'authentification
│   ├── game/ - Module principal du jeu
│   │   ├── dto/ - Objets de transfert de données
│   │   ├── entities/ - Entités du jeu
│   │   ├── services/ - Services du jeu
│   │   │   ├── GameAction.service.ts - Gestion des actions de jeu
│   │   │   ├── GameManagement.service.ts - Gestion des parties
│   │   │   ├── GameSave.service.ts - Sauvegarde des parties
│   │   │   └── GameMatchmaking.service.ts - Gestion du matchmaking
│   │   ├── ClientStore.ts - Stockage des clients WebSocket
│   │   ├── connection.provider.ts - Authentification WebSocket
│   │   ├── game.adapter.interface.ts - Interface d'adaptation des données
│   │   ├── game.gateway.ts - Gateway WebSocket
│   │   ├── game.list.ts - Gestion des listes de parties
│   │   ├── game.model.ts - Interactions avec la base de données
│   │   ├── game.module.ts - Module NestJS du jeu
│   │   └── game.service.ts - Service principal du jeu
│   └── users/ - Module de gestion des utilisateurs
└── prisma/ - Configuration et schémas Prisma
```

## Installation et configuration

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Docker et Docker Compose

### Étapes d'installation
1. Cloner le dépôt
   ```bash
   git clone https://github.com/votre-username/VimChess-Backend.git
   cd VimChess-Backend/vim-chess-api
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
   - Copier le fichier `.env.example` en `.env`
   - Modifier les valeurs selon votre environnement
   ```bash
   cp .env.example .env
   ```

4. Démarrer la base de données PostgreSQL avec Docker
   ```bash
   npm run db:dev:up
   ```

5. Appliquer les migrations Prisma
   ```bash
   npm run prisma:deploy:dev
   ```

## Démarrage de l'application

### Mode développement
```bash
npm run start:dev
```

### Mode production
```bash
npm run build
npm run start:prod
```


## Fonctionnalité de Matchmaking
Le système de matchmaking permet de :
- Mettre les joueurs en file d'attente
- Associer les joueurs en fonction de leur niveau (ELO)
- Créer automatiquement des parties lorsqu'un match est trouvé
- Notifier les joueurs via WebSocket
- Gérer les timeouts pour les joueurs qui ne répondent pas
- Proposer et gérer les rematchs après une partie

## Licence
Ce projet est sous licence [LICENSE](LICENSE).

Ce projet a été inspiré par [nestjs-api-tutorial](https://github.com/vladwulf/nestjs-api-tutorial.git) de vladwulf.

