// models/ContactMessage.js
// Modèle représentant un message envoyé via le formulaire de contact.
// Ce modèle n'est pas lié aux utilisateurs : n'importe qui peut envoyer
// un message (même un visiteur non connecté).

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'contact_messages',
  // On garde seulement createdAt (date d'envoi), pas updatedAt
  // car un message de contact ne se modifie jamais après envoi.
  timestamps: true,
  updatedAt: false,
});

module.exports = ContactMessage;
