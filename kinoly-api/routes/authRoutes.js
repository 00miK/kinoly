// routes/authRoutes.js
// Définit les routes liées à l'authentification.
// Chaque route passe d'abord par le middleware de validation (validate)
// avant d'atteindre le controller. L'ordre des middlewares est important.

const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../middlewares/schemas/authSchemas');

// POST /api/auth/register
// 1. validate(registerSchema) → vérifie que le body est conforme
// 2. register → crée l'utilisateur et renvoie le token
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
// 1. validate(loginSchema) → vérifie que email et password sont présents
// 2. login → vérifie les credentials et renvoie le token
router.post('/login', validate(loginSchema), login);

module.exports = router;
