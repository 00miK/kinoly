// middlewares/schemas/contactSchemas.js
// Schéma de validation pour le formulaire de contact.

const Joi = require('joi');

const contactSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères.',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères.',
      'any.required': 'Le nom est obligatoire.',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'adresse email n\'est pas valide.',
      'any.required': 'L\'email est obligatoire.',
    }),

  message: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Le message doit contenir au moins 10 caractères.',
      'string.max': 'Le message ne peut pas dépasser 1000 caractères.',
      'any.required': 'Le message est obligatoire.',
    }),
});

module.exports = { contactSchema };
