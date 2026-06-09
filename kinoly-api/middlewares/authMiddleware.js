// middlewares/authMiddleware.js
// Middlewares de protection des routes.
//
// protect     → vérifie qu'un token JWT valide est présent dans la requête
// restrictTo  → vérifie que l'utilisateur connecté a le bon rôle
//
// Utilisation typique dans une route :
//   router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);

const jwt = require('jsonwebtoken');

// ============================================================
// protect
// À utiliser sur toutes les routes qui nécessitent d'être connecté.
// Lit le header Authorization, vérifie le token, attache l'user à req.
// ============================================================
const protect = (req, res, next) => {
  // Le token doit être envoyé dans le header sous la forme :
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5c...
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 401,
      message: 'Accès refusé. Aucun token fourni.',
    });
  }

  // Extraction du token : on retire le préfixe "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify() décode ET vérifie la signature du token.
    // Si le token est expiré ou falsifié, il lève une exception.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // On attache le payload décodé à la requête pour l'utiliser
    // dans les controllers suivants (ex: req.user.id pour savoir qui agit)
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: 'Token invalide ou expiré.',
    });
  }
};

// ============================================================
// restrictTo(...roles)
// À utiliser après protect, pour limiter l'accès à certains rôles.
// Exemple : restrictTo('admin') n'autorise que les administrateurs.
// Exemple : restrictTo('admin', 'moderator') autorise les deux rôles.
// ============================================================
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user est garanti d'exister car protect est appelé avant
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        message: 'Accès interdit. Vous n\'avez pas les droits nécessaires.',
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
