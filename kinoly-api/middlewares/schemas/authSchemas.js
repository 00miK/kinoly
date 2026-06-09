// middlewares/schemas/authSchemas.js
// Schémas de validation Joi pour les routes d'authentification.
// Joi permet de définir des règles précises sur ce qu'on accepte en entrée,
// avant même d'atteindre le controller. C'est la première ligne de défense.

const Joi = require('joi');

// Schéma pour l'inscription
const registerSchema = Joi.object({
  pseudo: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'Le pseudo doit contenir au moins 3 caractères.',
      'string.max': 'Le pseudo ne peut pas dépasser 30 caractères.',
      'any.required': 'Le pseudo est obligatoire.',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'adresse email n\'est pas valide.',
      'any.required': 'L\'email est obligatoire.',
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères.',
      'any.required': 'Le mot de passe est obligatoire.',
    }),
});

// Schéma pour la connexion
// On valide seulement que les champs sont présents et non vides,
// la vérification du mot de passe se fait dans le controller.
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'adresse email n\'est pas valide.',
      'any.required': 'L\'email est obligatoire.',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Le mot de passe est obligatoire.',
    }),
});

module.exports = { registerSchema, loginSchema };
