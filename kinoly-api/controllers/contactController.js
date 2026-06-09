// controllers/contactController.js
// Gère la réception et la sauvegarde des messages du formulaire de contact.
// Route publique : aucune authentification requise.

const { ContactMessage } = require('../models/index');

// ============================================================
// POST /api/contact
// Sauvegarde un message de contact en base de données.
// ============================================================
const sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const nouveauMessage = await ContactMessage.create({ name, email, message });

    return res.status(201).json({
      status: 201,
      message: 'Votre message a bien été envoyé. Nous vous répondrons rapidement.',
      data: {
        id: nouveauMessage.id,
        createdAt: nouveauMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('[sendMessage]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

module.exports = { sendMessage };
