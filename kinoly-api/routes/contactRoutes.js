// routes/contactRoutes.js
// Route publique pour le formulaire de contact.

const express = require('express');
const router  = express.Router();

const { sendMessage }   = require('../controllers/contactController');
const validate          = require('../middlewares/validate');
const { contactSchema } = require('../middlewares/schemas/contactSchemas');

// POST /api/contact
router.post('/', validate(contactSchema), sendMessage);

module.exports = router;
