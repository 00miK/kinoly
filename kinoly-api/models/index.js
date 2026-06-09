// models/index.js
// Point central de tous les modèles Sequelize.
// Ce fichier a deux responsabilités :
//   1. Importer tous les modèles pour les exposer depuis un seul endroit
//   2. Définir toutes les associations (relations) entre les modèles
//
// Pourquoi centraliser les associations ici plutôt que dans chaque modèle ?
// Pour éviter les imports circulaires : si User.js importait Movie.js
// et Movie.js importait User.js, Node.js entrerait dans une boucle infinie.

const { sequelize } = require('../config/database');

// --- Import de tous les modèles ---
const User          = require('./User');
const Movie         = require('./Movie');
const Review        = require('./Review');
const Genre         = require('./Genre');
const MovieGenre    = require('./MovieGenre');
const ContactMessage = require('./ContactMessage');

// ============================================================
// ASSOCIATIONS (RELATIONS ENTRE LES MODÈLES)
// Chaque association crée automatiquement la clé étrangère
// correspondante dans la table Sequelize.
// ============================================================

// Un utilisateur peut avoir plusieurs films
// → Ajoute la colonne user_id dans la table movies
User.hasMany(Movie, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Movie.belongsTo(User, { foreignKey: 'user_id' });
// onDelete: 'CASCADE' : si un utilisateur est supprimé, ses films le sont aussi

// Un utilisateur peut avoir plusieurs critiques
// → Ajoute la colonne user_id dans la table reviews
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Un film peut avoir plusieurs critiques
// → Ajoute la colonne movie_id dans la table reviews
Movie.hasMany(Review, { foreignKey: 'movie_id', onDelete: 'CASCADE' });
Review.belongsTo(Movie, { foreignKey: 'movie_id' });

// Relation many-to-many entre films et genres via la table de jonction
// Un film peut avoir plusieurs genres, un genre peut concerner plusieurs films
Movie.belongsToMany(Genre, { through: MovieGenre, foreignKey: 'movie_id' });
Genre.belongsToMany(Movie, { through: MovieGenre, foreignKey: 'genre_id' });

// ============================================================
// SYNCHRONISATION AVEC LA BASE DE DONNÉES
// sequelize.sync({ alter: true }) compare les modèles avec les tables
// existantes et applique les modifications nécessaires (ajout de colonnes,
// modification de types...) sans supprimer les données.
//
// ATTENTION : alter: true est pratique en développement, mais en production
// on utiliserait des migrations (fichiers versionnés) pour plus de contrôle.
// ============================================================
const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Tables synchronisées avec la base de données.');
  } catch (error) {
    console.error('Erreur lors de la synchronisation des tables :', error.message);
    process.exit(1);
  }
};

// Export de tous les modèles et de la fonction syncDB
// pour les utiliser dans le reste de l'application
module.exports = {
  sequelize,
  syncDB,
  User,
  Movie,
  Review,
  Genre,
  MovieGenre,
  ContactMessage,
};
