// models/User.js
// Modèle représentant un utilisateur de l'application.
// Chaque utilisateur peut ajouter des films et écrire des critiques.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pseudo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Deux utilisateurs ne peuvent pas avoir le même pseudo
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Un email = un compte
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    // Le mot de passe sera hashé avec bcryptjs avant d'être sauvegardé
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user', // Par défaut, tout nouvel inscrit est un utilisateur normal
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true, // L'avatar est facultatif
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Le profil est public par défaut
  },
}, {
  tableName: 'users',   // Nom explicite de la table en base
  timestamps: true,     // Sequelize gère createdAt et updatedAt automatiquement
});

module.exports = User;
