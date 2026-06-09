// models/Genre.js
// Modèle représentant un genre cinématographique (Action, Comédie, Thriller...).
// Un film peut appartenir à plusieurs genres, et un genre peut contenir
// plusieurs films : c'est une relation many-to-many gérée via MovieGenre.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Genre = sequelize.define('Genre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Pas deux genres avec le même nom (ex: pas deux "Action")
  },
}, {
  tableName: 'genres',
  timestamps: false, // Les genres n'ont pas besoin de createdAt/updatedAt
});

module.exports = Genre;
