// middlewares/upload.js
// Configure multer pour gérer l'upload de fichiers image.
// Multer est un middleware qui traite les requêtes de type multipart/form-data,
// le format standard des formulaires HTML avec des fichiers joints.

const multer = require('multer');
const path   = require('path');

// --- Types MIME acceptés ---
// On n'autorise que les formats image courants pour les affiches de films.
const TYPES_AUTORISES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Taille maximale : 5 Mo (en octets)
const TAILLE_MAX = 5 * 1024 * 1024;

// ============================================================
// STRATÉGIE DE STOCKAGE : diskStorage
// diskStorage permet de contrôler précisément où et comment
// le fichier est sauvegardé sur le disque.
// L'alternative (memoryStorage) garde le fichier en RAM,
// ce qui est adapté aux petits fichiers ou aux uploads cloud.
// ============================================================
const storage = multer.diskStorage({
  // Dossier de destination
  destination: (req, file, cb) => {
    // cb(erreur, chemin) : le premier argument est null si pas d'erreur
    cb(null, 'uploads/');
  },

  // Nom du fichier sauvegardé
  filename: (req, file, cb) => {
    // On construit un nom unique : timestamp + nom original nettoyé
    // Le nettoyage remplace les espaces par des tirets pour éviter
    // les problèmes dans les URLs (ex: "mon film.jpg" → "mon-film.jpg")
    const nomNettoye = file.originalname.replace(/\s+/g, '-').toLowerCase();
    const nomFichier = `${Date.now()}-${nomNettoye}`;
    cb(null, nomFichier);
  },
});

// ============================================================
// FILTRE DE FICHIER
// Appelé avant le stockage pour valider le type du fichier.
// Si on appelle cb(null, false), multer rejette le fichier
// sans lancer d'erreur — on lève donc une erreur manuellement.
// ============================================================
const fileFilter = (req, file, cb) => {
  if (TYPES_AUTORISES.includes(file.mimetype)) {
    cb(null, true); // Fichier accepté
  } else {
    // On attache l'erreur à req pour la gérer dans le controller
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  }
};

// ============================================================
// INSTANCE MULTER
// On assemble la config : stockage + filtre + taille max.
// ============================================================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: TAILLE_MAX,
  },
});

// ============================================================
// GESTIONNAIRE D'ERREURS MULTER
// Multer lève ses propres erreurs (MulterError). On les intercepte
// ici pour renvoyer des messages clairs en JSON plutôt que
// de laisser Express afficher une erreur générique.
// Ce wrapper est utilisé dans les routes à la place de upload directement.
// ============================================================
const handleUpload = (champ) => (req, res, next) => {
  upload.single(champ)(req, res, (err) => {
    if (!err) return next(); // Tout s'est bien passé

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 400,
          message: 'Le fichier dépasse la taille maximale autorisée (5 Mo).',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          status: 400,
          message: 'Format de fichier non supporté. Utilisez jpg, jpeg, png ou webp.',
        });
      }
    }

    // Erreur inconnue
    console.error('[upload]', err);
    return res.status(500).json({ status: 500, message: 'Erreur lors de l\'upload.' });
  });
};

module.exports = { handleUpload };
