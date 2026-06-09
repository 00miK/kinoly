// middlewares/schemas/movieSchemas.js
// Schémas de validation Joi pour les routes films et critiques.

const Joi = require('joi');

// Année minimale du cinéma (premier film des frères Lumière : 1888)
const ANNEE_MIN = 1888;
const ANNEE_MAX = new Date().getFullYear();

// --- Schéma de création d'un film ---
const createMovieSchema = Joi.object({
  title: Joi.string()
    .required()
    .messages({ 'any.required': 'Le titre est obligatoire.' }),

  director: Joi.string().optional().allow('', null),

  year: Joi.number()
    .integer()
    .min(ANNEE_MIN)
    .max(ANNEE_MAX)
    .optional()
    .allow(null)
    .messages({
      'number.min': `L'année doit être supérieure à ${ANNEE_MIN}.`,
      'number.max': `L'année ne peut pas dépasser ${ANNEE_MAX}.`,
    }),

  synopsis: Joi.string().optional().allow('', null),

  poster_url: Joi.string().uri().optional().allow('', null).messages({
    'string.uri': 'L\'URL de l\'affiche n\'est pas valide.',
  }),

  // Tableau d'ids de genres (ex: [1, 3])
  genres: Joi.array().items(Joi.number().integer()).optional(),
});

// --- Schéma de mise à jour d'un film ---
// Tous les champs sont optionnels : on envoie uniquement ce qu'on modifie
const updateMovieSchema = Joi.object({
  title: Joi.string().optional(),
  director: Joi.string().optional().allow('', null),
  year: Joi.number().integer().min(ANNEE_MIN).max(ANNEE_MAX).optional().allow(null),
  synopsis: Joi.string().optional().allow('', null),
  poster_url: Joi.string().uri().optional().allow('', null),
  genres: Joi.array().items(Joi.number().integer()).optional(),
});

// --- Schéma de création d'une critique ---
const createReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'La note doit être entre 1 et 5.',
      'number.max': 'La note doit être entre 1 et 5.',
      'any.required': 'La note est obligatoire.',
    }),

  content: Joi.string().optional().allow('', null),

  status: Joi.string()
    .valid('seen', 'to_watch', 'watching')
    .required()
    .messages({
      'any.only': 'Le statut doit être "seen", "to_watch" ou "watching".',
      'any.required': 'Le statut est obligatoire.',
    }),

  // L'id du film est passé dans le body de la requête POST /api/reviews
  movie_id: Joi.number()
    .integer()
    .required()
    .messages({ 'any.required': 'L\'id du film est obligatoire.' }),
});

// --- Schéma de mise à jour d'une critique ---
// Au moins un champ doit être présent (géré dans le controller)
const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  content: Joi.string().optional().allow('', null),
  status: Joi.string().valid('seen', 'to_watch', 'watching').optional(),
});

module.exports = {
  createMovieSchema,
  updateMovieSchema,
  createReviewSchema,
  updateReviewSchema,
};
