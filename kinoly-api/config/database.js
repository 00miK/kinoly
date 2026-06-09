// config/database.js
// Ce fichier configure la connexion à la base de données MySQL via Sequelize.
// On utilise les variables d'environnement du fichier .env pour ne jamais
// écrire les identifiants en dur dans le code (bonne pratique de sécurité).

const { Sequelize } = require('sequelize');

// Création de l'instance Sequelize avec les paramètres de connexion
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nom de la base de données
  process.env.DB_USER,     // Utilisateur MySQL
  process.env.DB_PASSWORD, // Mot de passe MySQL
  {
    host: process.env.DB_HOST, // Adresse du serveur (localhost en dev)
    dialect: 'mysql',          // On précise qu'on utilise MySQL
    logging: false,            // Désactive les logs SQL dans la console (trop verbeux)
  }
);

// Fonction qui teste la connexion au démarrage du serveur.
// Elle est appelée dans index.js pour s'assurer que la DB est accessible
// avant de commencer à accepter des requêtes.
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Base de données connectée avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données :', error.message);
    // On arrête le processus si la DB est inaccessible,
    // car l'API ne peut pas fonctionner sans elle.
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
