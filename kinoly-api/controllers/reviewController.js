// controllers/reviewController.js
// Gère la création, modification et suppression des critiques (reviews).

const { Review, Movie, User } = require('../models/index');

// ============================================================
// POST /api/reviews
// Crée une critique pour un film. Nécessite d'être connecté.
// Un utilisateur ne peut avoir qu'une seule critique par film.
// ============================================================
const createReview = async (req, res) => {
  try {
    const { rating, content, status, movie_id } = req.body;

    // Vérifier que le film existe avant de créer la critique
    const film = await Movie.findByPk(movie_id);
    if (!film) {
      return res.status(404).json({ status: 404, message: 'Film non trouvé.' });
    }

    // Vérifier qu'une critique n'existe pas déjà pour ce film/utilisateur
    const reviewExistante = await Review.findOne({
      where: { movie_id, user_id: req.user.id },
    });
    if (reviewExistante) {
      return res.status(409).json({
        status: 409,
        message: 'Vous avez déjà une critique pour ce film.',
      });
    }

    const review = await Review.create({
      rating,
      content,
      status,
      movie_id,
      user_id: req.user.id,
    });

    // On recharge avec les associations pour une réponse enrichie
    const reviewComplete = await Review.findByPk(review.id, {
      include: [
        { model: User, attributes: ['id', 'pseudo'] },
        { model: Movie, attributes: ['id', 'title'] },
      ],
    });

    return res.status(201).json({
      status: 201,
      message: 'Critique ajoutée avec succès.',
      data: reviewComplete,
    });
  } catch (error) {
    console.error('[createReview]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// PUT /api/reviews/:id
// Met à jour une critique. Accessible uniquement au propriétaire.
// ============================================================
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ status: 404, message: 'Critique non trouvée.' });
    }

    // Seul le propriétaire peut modifier sa critique
    if (review.user_id !== req.user.id) {
      return res.status(403).json({
        status: 403,
        message: 'Accès interdit. Vous n\'êtes pas l\'auteur de cette critique.',
      });
    }

    const { rating, content, status } = req.body;

    await review.update({
      ...(rating  !== undefined && { rating }),
      ...(content !== undefined && { content }),
      ...(status  !== undefined && { status }),
    });

    const reviewMiseAJour = await Review.findByPk(review.id, {
      include: [
        { model: User, attributes: ['id', 'pseudo'] },
        { model: Movie, attributes: ['id', 'title'] },
      ],
    });

    return res.status(200).json({
      status: 200,
      message: 'Critique mise à jour avec succès.',
      data: reviewMiseAJour,
    });
  } catch (error) {
    console.error('[updateReview]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// DELETE /api/reviews/:id
// Supprime une critique. Accessible au propriétaire ou à un admin.
// ============================================================
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ status: 404, message: 'Critique non trouvée.' });
    }

    const estProprietaire = review.user_id === req.user.id;
    const estAdmin = req.user.role === 'admin';

    if (!estProprietaire && !estAdmin) {
      return res.status(403).json({
        status: 403,
        message: 'Accès interdit. Vous n\'êtes pas l\'auteur de cette critique.',
      });
    }

    await review.destroy();

    return res.status(200).json({
      status: 200,
      message: 'Critique supprimée avec succès.',
    });
  } catch (error) {
    console.error('[deleteReview]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

module.exports = { createReview, updateReview, deleteReview };
