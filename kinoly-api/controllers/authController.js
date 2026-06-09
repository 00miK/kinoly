// controllers/authController.js
// Gère l'inscription et la connexion des utilisateurs.
// Le controller reçoit la requête validée, applique la logique métier,
// et renvoie la réponse JSON.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

// Nombre de tours de hachage pour bcrypt.
// 10 est la valeur standard : bon équilibre entre sécurité et performance.
const SALT_ROUNDS = 10;

// Durée de validité du JWT : 7 jours.
const JWT_EXPIRY = '7d';

// ============================================================
// Fonction utilitaire : génère un JWT pour un utilisateur donné.
// On y met uniquement les données nécessaires (id, email, role),
// jamais le mot de passe ni des données sensibles.
// ============================================================
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// ============================================================
// POST /api/auth/register
// Inscription d'un nouvel utilisateur.
// ============================================================
const register = async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: 'Un compte existe déjà avec cet email.',
      });
    }

    // Vérifier si le pseudo est déjà pris
    const existingPseudo = await User.findOne({ where: { pseudo } });
    if (existingPseudo) {
      return res.status(409).json({
        status: 409,
        message: 'Ce pseudo est déjà utilisé.',
      });
    }

    // Hasher le mot de passe avant de le stocker en base.
    // bcrypt.hash() est asynchrone et génère automatiquement un "sel"
    // aléatoire : deux hachages du même mot de passe donnent des résultats
    // différents, ce qui protège contre les attaques par table arc-en-ciel.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Créer l'utilisateur en base de données
    const user = await User.create({
      pseudo,
      email,
      password: hashedPassword,
    });

    // Générer le token JWT
    const token = generateToken(user);

    // Renvoyer le token et les infos publiques de l'utilisateur.
    // On construit manuellement l'objet pour ne JAMAIS exposer le password.
    return res.status(201).json({
      status: 201,
      message: 'Compte créé avec succès.',
      token,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        is_public: user.is_public,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[register]', error);
    return res.status(500).json({
      status: 500,
      message: 'Erreur interne du serveur.',
    });
  }
};

// ============================================================
// POST /api/auth/login
// Connexion d'un utilisateur existant.
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Chercher l'utilisateur par email
    const user = await User.findOne({ where: { email } });

    // Si l'utilisateur n'existe pas OU si le mot de passe est incorrect,
    // on renvoie TOUJOURS le même message d'erreur générique.
    // Pourquoi ? Pour ne pas indiquer à un attaquant si l'email existe.
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // Comparer le mot de passe fourni avec le hash stocké en base
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // Génération du token JWT
    const token = generateToken(user);

    return res.status(200).json({
      status: 200,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        is_public: user.is_public,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[login]', error);
    return res.status(500).json({
      status: 500,
      message: 'Erreur interne du serveur.',
    });
  }
};

module.exports = { register, login };
