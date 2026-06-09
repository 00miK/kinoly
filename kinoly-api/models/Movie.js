// models/Movie.js
// Modèle représentant un film ajouté par un utilisateur.
// Chaque film appartient à un utilisateur (celui qui l'a ajouté)
// et peut recevoir des critiques.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, // Un film doit obligatoirement avoir un titre
  },
  director: {
    type: DataTypes.STRING,
    allowNull: true, // Le réalisateur peut être renseigné plus tard
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true, // L'année de sortie est facultative
  },
  synopsis: {
    type: DataTypes.TEXT, // TEXT pour un texte long (vs STRING limité à 255 chars)
    allowNull: true,
  },
  poster_url: {
    type: DataTypes.STRING,
    allowNull: true, // L'URL de l'affiche est facultative
  },
  // La clé étrangère user_id sera ajoutée automatiquement
  // par l'association Movie.belongsTo(User) dans models/index.js
}, {
  tableName: 'movies',
  timestamps: true,
});

module.exports = Movie;
