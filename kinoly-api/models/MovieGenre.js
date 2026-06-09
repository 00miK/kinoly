// models/MovieGenre.js
// Table de jonction pour la relation many-to-many entre Movie et Genre.
// Sequelize a besoin de ce modèle intermédiaire pour gérer la relation
// belongsToMany. Il crée une table avec deux clés étrangères : movie_id et genre_id.
// On pourrait laisser Sequelize la générer automatiquement, mais la définir
// explicitement donne plus de contrôle (ex: ajouter des colonnes supplémentaires plus tard).

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MovieGenre = sequelize.define('MovieGenre', {
  // Sequelize ajoutera automatiquement movie_id et genre_id
  // via les associations belongsToMany définies dans models/index.js
}, {
  tableName: 'movie_genres',
  timestamps: false, // Cette table de liaison n'a pas besoin d'horodatage
});

module.exports = MovieGenre;
