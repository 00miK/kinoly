// controllers/adminController.js
// Fonctions réservées aux administrateurs.
// Toutes ces routes sont protégées par protect + restrictTo('admin').

const { User, Movie, Review, ContactMessage } = require('../models/index');
const { fn, col, literal } = require('sequelize');

// ============================================================
// GET /api/admin/users
// Liste tous les utilisateurs avec leur nombre de films et de critiques.
// ============================================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      // On exclut le password de la réponse via l'option attributes
      attributes: {
        exclude: ['password'],
        // On ajoute deux colonnes calculées : le nombre de films et de reviews
        // fn('COUNT', ...) → appel à la fonction SQL COUNT()
        // literal('DISTINCT `Movies`.`id`') → compte les films distincts
        include: [
          [fn('COUNT', literal('DISTINCT `Movies`.`id`')), 'totalFilms'],
          [fn('COUNT', literal('DISTINCT `Reviews`.`id`')), 'totalCritiques'],
        ],
      },
      // On inclut les modèles pour que Sequelize génère les JOINs nécessaires
      // aux COUNT() ci-dessus. On n'inclut aucun attribut de ces modèles
      // car on ne veut que les comptages, pas les données détaillées.
      include: [
        { model: Movie,  attributes: [] },
        { model: Review, attributes: [] },
      ],
      // GROUP BY obligatoire quand on utilise des fonctions d'agrégation
      group: ['User.id'],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      status: 200,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('[getAllUsers]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// PATCH /api/admin/users/:id/role
// Modifie le rôle d'un utilisateur (user ↔ admin).
// On utilise PATCH (modification partielle) plutôt que PUT (remplacement complet).
// ============================================================
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validation simple du rôle (Joi pourrait aussi le faire, mais c'est léger)
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 400,
        message: 'Rôle invalide. Les valeurs acceptées sont "user" ou "admin".',
      });
    }

    // Un admin ne peut pas modifier son propre rôle (sécurité : évite l'auto-dégradation)
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(403).json({
        status: 403,
        message: 'Vous ne pouvez pas modifier votre propre rôle.',
      });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: 'Utilisateur non trouvé.' });
    }

    await user.update({ role });

    return res.status(200).json({
      status: 200,
      message: `Rôle mis à jour : ${user.pseudo} est maintenant "${role}".`,
      data: user,
    });
  } catch (error) {
    console.error('[updateUserRole]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// DELETE /api/admin/users/:id
// Supprime un utilisateur et tout son contenu (cascade).
// ============================================================
const deleteUser = async (req, res) => {
  try {
    // Un admin ne peut pas se supprimer lui-même
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(403).json({
        status: 403,
        message: 'Vous ne pouvez pas supprimer votre propre compte.',
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 404, message: 'Utilisateur non trouvé.' });
    }

    await user.destroy();
    // Les films et reviews sont supprimés automatiquement grâce au
    // onDelete: 'CASCADE' défini dans les associations de models/index.js

    return res.status(200).json({
      status: 200,
      message: `L'utilisateur "${user.pseudo}" et tout son contenu ont été supprimés.`,
    });
  } catch (error) {
    console.error('[deleteUser]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// GET /api/admin/messages
// Renvoie tous les messages de contact, triés du plus récent au plus ancien.
// ============================================================
const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      status: 200,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('[getAllMessages]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getAllMessages };
