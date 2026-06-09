// models/Review.js
// Modèle représentant la critique/avis d'un utilisateur sur un film.
// Une critique lie un utilisateur à un film, avec une note, un statut et un commentaire.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Validation Sequelize : la note doit être entre 1 et 5
    validate: {
      min: 1,
      max: 5,
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true, // L'utilisateur peut noter sans écrire de commentaire
  },
  status: {
    type: DataTypes.ENUM('seen', 'to_watch', 'watching'),
    allowNull: false,
    // 'seen'     : film déjà vu
    // 'to_watch' : dans la liste à voir
    // 'watching' : en cours de visionnage
  },
  // Les clés étrangères user_id et movie_id seront ajoutées
  // automatiquement par les associations dans models/index.js
}, {
  tableName: 'reviews',
  timestamps: true,
});

module.exports = Review;
