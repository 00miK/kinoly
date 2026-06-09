// routes/index.js
// Ce fichier est le routeur principal de l'API.
// Il centralise toutes les routes et les préfixe avec /api.
// Plus tard, on y branchera les routeurs spécifiques (films, utilisateurs, etc.)

const express = require('express');
const router = express.Router();

// --- Route de santé ---
// GET /api/health
// Permet de vérifier rapidement que l'API est en ligne et répond correctement.
// Très utile en développement et pour les outils de monitoring en production.
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'L\'API Kinoly fonctionne correctement.',
    timestamp: new Date().toISOString(), // Horodatage de la réponse
  });
});

// Les routes métier seront ajoutées ici plus tard
// Exemple futur : router.use('/films', filmsRouter);
// Exemple futur : router.use('/auth', authRouter);

module.exports = router;
