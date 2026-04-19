# Plateforme de gestion du matériel universitaire

Application web de gestion du matériel universitaire avec rôles séparés pour les étudiants, les techniciens et les administrateurs. Le projet permet de consulter le catalogue, effectuer des réservations, gérer les maintenances et suivre les pénalités.

## Fonctionnalités

- Authentification et routes protégées
- Catalogue du matériel pour les étudiants
- Réservations et suivi des demandes
- Gestion des pénalités
- Gestion des tickets de maintenance
- Tableau de bord administrateur et technicien

## Technologies utilisées

- Frontend : React, Vite, React Router, Tailwind CSS
- Backend : Node.js, Express, MongoDB, Mongoose
- Services : Cloudinary, JWT, bcrypt

## Structure du projet

- `client/` : application frontend
- `server/` : API backend

## Prérequis

- Node.js installé
- MongoDB accessible
- Un compte Cloudinary si vous utilisez l’envoi d’images

## Installation

### 1. Installer les dépendances

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configurer le serveur

Créez un fichier `.env` dans le dossier `server/` avec au minimum :

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
OVERDUE_JOB_HOUR=8
PENALTY_PER_DAY=5
```

## Lancer le projet

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

Le frontend appelle l’API sur `http://localhost:5000`.

## Notes

- Les routes API principales sont exposées sous `/api/auth`, `/api/equipment`, `/api/reservations`, `/api/penalties` et `/api/maintenance`.
- Si vous changez le port du serveur, pensez à mettre à jour les URLs utilisées dans le client.

## License

À définir.