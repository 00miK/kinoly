// index.js
// Point d'entrée de l'application Kinoly API.
// Ce fichier initialise Express, configure les middlewares globaux,
// branche les routes et démarre le serveur.

// On charge les variables du fichier .env en tout premier,
// avant d'importer quoi que ce soit d'autre qui en aurait besoin.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const { syncDB } = require('./models/index');
const router = require('./routes/index');

const app = express();

// ============================================================
// MIDDLEWARES GLOBAUX
// Les middlewares sont des fonctions qui s'exécutent sur chaque
// requête avant d'atteindre les routes. Ordre important.
// ============================================================

// Helmet : ajoute automatiquement des headers HTTP de sécurité
// (ex: X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet());

// CORS : autorise les requêtes depuis d'autres origines (ex: le front-end)
// En production, on restreindrait l'origine autorisée à l'URL du front.
app.use(cors());

// Parsing JSON : permet à Express de lire le corps (body) des requêtes JSON
app.use(express.json());

// Rate limiter : limite le nombre de requêtes par IP pour se protéger
// contre les abus et les attaques par force brute.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 100,                  // Maximum 100 requêtes par IP sur cette fenêtre
  standardHeaders: true,     // Inclut les infos de limite dans les headers de réponse
  legacyHeaders: false,      // Désactive les anciens headers X-RateLimit-*
  message: {
    status: 429,
    message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.',
  },
});
app.use(limiter);

// ============================================================
// FICHIERS STATIQUES
// Le dossier uploads/ est servi publiquement : une image uploadée
// sera accessible via http://localhost:3001/uploads/nom-du-fichier.jpg
// express.static() lit directement le fichier sur le disque
// sans passer par les routes Express.
// ============================================================
app.use('/uploads', express.static('uploads'));

// ============================================================
// ROUTES
// On préfixe toutes les routes avec /api pour les distinguer
// d'éventuels fichiers statiques ou d'autres services.
// ============================================================
app.use('/api', router);

// Gestion des routes inexistantes (404)
// Ce middleware est placé après toutes les routes : si aucune n'a répondu,
// c'est que l'URL demandée n'existe pas.
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: `La route ${req.method} ${req.originalUrl} n'existe pas.`,
  });
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// On teste d'abord la connexion à la base de données,
// puis on lance le serveur seulement si tout est OK.
// ============================================================
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  // Connexion à la base de données (arrête le process en cas d'échec)
  await connectDB();

  // Synchronisation des modèles avec la base de données
  // Crée ou met à jour les tables selon les modèles définis
  await syncDB();

  // Démarrage du serveur Express
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}.`);
    console.log(`Route de santé : http://localhost:${PORT}/api/health`);
  });
};

startServer();
