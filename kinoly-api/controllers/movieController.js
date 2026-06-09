// controllers/movieController.js
// Gère toutes les opérations CRUD sur les films.

const { Op, literal } = require('sequelize');
const { Movie, User, Genre, Review, MovieGenre } = require('../models/index');

// ============================================================
// GET /api/movies
// Récupère tous les films avec filtres optionnels.
// Route publique : pas besoin d'être connecté pour lire.
// ============================================================
const getAllMovies = async (req, res) => {
  try {
    const { search, genre, year, rating, status } = req.query;

    // --- Construction du filtre WHERE sur la table movies ---
    const whereMovie = {};

    // Recherche par titre ou réalisateur (insensible à la casse via LIKE)
    if (search) {
      whereMovie[Op.or] = [
        { title:    { [Op.like]: `%${search}%` } },
        { director: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filtre par année exacte
    if (year) {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) whereMovie.year = parsedYear;
    }

    // --- Filtres via sous-requêtes SQL ---
    // On utilise Op.and pour combiner plusieurs conditions sur l'id du film
    const andConditions = [];

    // Filtre par note moyenne minimale (calculée depuis la table reviews)
    if (rating) {
      const parsedRating = parseInt(rating, 10);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        andConditions.push(
          // Sous-requête : films dont la moyenne des notes est >= à la valeur demandée
          literal(
            `\`Movie\`.\`id\` IN (
              SELECT movie_id FROM reviews
              GROUP BY movie_id
              HAVING AVG(rating) >= ${parsedRating}
            )`
          )
        );
      }
    }

    // Filtre par statut des reviews DE L'UTILISATEUR CONNECTÉ.
    // req.user n'existe que si le token a été envoyé et est valide.
    // (protect n'est pas appliqué sur cette route, le filtre est ignoré si non connecté)
    if (status && req.user) {
      const statutsAutorises = ['seen', 'to_watch', 'watching'];
      if (statutsAutorises.includes(status)) {
        andConditions.push(
          literal(
            `\`Movie\`.\`id\` IN (
              SELECT movie_id FROM reviews
              WHERE user_id = ${req.user.id} AND status = '${status}'
            )`
          )
        );
      }
    }

    if (andConditions.length > 0) {
      whereMovie[Op.and] = andConditions;
    }

    // --- Configuration de l'include Genre ---
    // Si un filtre par genre est demandé, on fait un INNER JOIN (required: true)
    // pour n'inclure que les films qui ont ce genre.
    const genreInclude = {
      model: Genre,
      through: { attributes: [] }, // Cache les colonnes de la table de jonction movie_genres
      attributes: ['id', 'name'],
    };
    if (genre) {
      genreInclude.where = { name: genre };
      genreInclude.required = true; // INNER JOIN : exclut les films sans ce genre
    }

    const movies = await Movie.findAll({
      where: whereMovie,
      include: [
        genreInclude,
        {
          model: User,
          attributes: ['id', 'pseudo'], // Jamais le password
        },
        {
          model: Review,
          attributes: ['id', 'rating', 'content', 'status', 'createdAt'],
          include: [{
            model: User,
            attributes: ['pseudo'], // Pseudo de l'auteur de la critique
          }],
        },
      ],
      order: [['createdAt', 'DESC']], // Plus récents en premier
    });

    // Si aucun film trouvé, on renvoie un tableau vide (pas une erreur 404)
    return res.status(200).json({
      status: 200,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    console.error('[getAllMovies]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// GET /api/movies/:id
// Récupère un film précis avec ses genres et toutes ses critiques.
// Route publique.
// ============================================================
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [
        {
          model: Genre,
          through: { attributes: [] },
          attributes: ['id', 'name'],
        },
        {
          model: User,
          attributes: ['id', 'pseudo'],
        },
        {
          model: Review,
          attributes: ['id', 'rating', 'content', 'status', 'createdAt', 'updatedAt'],
          include: [{
            model: User,
            attributes: ['id', 'pseudo'],
          }],
        },
      ],
    });

    if (!movie) {
      return res.status(404).json({ status: 404, message: 'Film non trouvé.' });
    }

    return res.status(200).json({ status: 200, data: movie });
  } catch (error) {
    console.error('[getMovieById]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// POST /api/movies
// Crée un nouveau film. Nécessite d'être connecté (protect).
// ============================================================
const createMovie = async (req, res) => {
  try {
    const { title, director, year, synopsis, poster_url, genres } = req.body;

    // Création du film lié à l'utilisateur connecté
    const movie = await Movie.create({
      title,
      director,
      year,
      synopsis,
      poster_url,
      user_id: req.user.id, // Injecté par le middleware protect
    });

    // Association des genres si fournis.
    // setGenres() est une méthode "magique" générée par Sequelize
    // grâce à l'association belongsToMany. Elle accepte un tableau d'ids
    // et gère automatiquement les entrées dans la table movie_genres.
    if (genres && genres.length > 0) {
      await movie.setGenres(genres);
    }

    // On recharge le film avec ses genres pour avoir une réponse complète
    const movieWithGenres = await Movie.findByPk(movie.id, {
      include: [
        { model: Genre, through: { attributes: [] }, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'pseudo'] },
      ],
    });

    return res.status(201).json({
      status: 201,
      message: 'Film créé avec succès.',
      data: movieWithGenres,
    });
  } catch (error) {
    console.error('[createMovie]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// PUT /api/movies/:id
// Met à jour un film. Accessible au propriétaire ou à un admin.
// ============================================================
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ status: 404, message: 'Film non trouvé.' });
    }

    // Vérification des droits : seul le propriétaire ou un admin peut modifier
    const estProprietaire = movie.user_id === req.user.id;
    const estAdmin = req.user.role === 'admin';

    if (!estProprietaire && !estAdmin) {
      return res.status(403).json({
        status: 403,
        message: 'Accès interdit. Vous n\'êtes pas le propriétaire de ce film.',
      });
    }

    const { title, director, year, synopsis, poster_url, genres } = req.body;

    // On ne met à jour que les champs effectivement envoyés dans le body
    await movie.update({
      ...(title      !== undefined && { title }),
      ...(director   !== undefined && { director }),
      ...(year       !== undefined && { year }),
      ...(synopsis   !== undefined && { synopsis }),
      ...(poster_url !== undefined && { poster_url }),
    });

    // Si des genres sont envoyés, setGenres() remplace toutes les anciennes associations
    if (genres !== undefined) {
      await movie.setGenres(genres);
    }

    // Rechargement avec associations pour la réponse
    const movieMisAJour = await Movie.findByPk(movie.id, {
      include: [
        { model: Genre, through: { attributes: [] }, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'pseudo'] },
      ],
    });

    return res.status(200).json({
      status: 200,
      message: 'Film mis à jour avec succès.',
      data: movieMisAJour,
    });
  } catch (error) {
    console.error('[updateMovie]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// DELETE /api/movies/:id
// Supprime un film. Accessible au propriétaire ou à un admin.
// Les reviews associées sont supprimées en cascade (défini dans les modèles).
// ============================================================
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ status: 404, message: 'Film non trouvé.' });
    }

    const estProprietaire = movie.user_id === req.user.id;
    const estAdmin = req.user.role === 'admin';

    if (!estProprietaire && !estAdmin) {
      return res.status(403).json({
        status: 403,
        message: 'Accès interdit. Vous n\'êtes pas le propriétaire de ce film.',
      });
    }

    await movie.destroy();

    return res.status(200).json({
      status: 200,
      message: 'Film supprimé avec succès.',
    });
  } catch (error) {
    console.error('[deleteMovie]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

// ============================================================
// POST /api/movies/:id/poster
// Upload de l'affiche d'un film. Accessible au propriétaire ou à un admin.
// Multer a déjà sauvegardé le fichier sur le disque avant d'arriver ici ;
// req.file contient les informations du fichier uploadé.
// ============================================================
const uploadPoster = async (req, res) => {
  try {
    // Si aucun fichier n'a été envoyé dans la requête
    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: 'Aucun fichier envoyé. Utilisez le champ "poster".',
      });
    }

    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ status: 404, message: 'Film non trouvé.' });
    }

    const estProprietaire = movie.user_id === req.user.id;
    const estAdmin = req.user.role === 'admin';

    if (!estProprietaire && !estAdmin) {
      return res.status(403).json({
        status: 403,
        message: 'Accès interdit. Vous n\'êtes pas le propriétaire de ce film.',
      });
    }

    // On construit l'URL publique accessible via /uploads/nom-du-fichier
    // req.file.filename contient le nom généré par multer (timestamp + nom original)
    const posterUrl = `/uploads/${req.file.filename}`;
    await movie.update({ poster_url: posterUrl });

    return res.status(200).json({
      status: 200,
      message: 'Affiche uploadée avec succès.',
      data: {
        poster_url: posterUrl,
        film: movie.title,
      },
    });
  } catch (error) {
    console.error('[uploadPoster]', error);
    return res.status(500).json({ status: 500, message: 'Erreur interne du serveur.' });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, uploadPoster };
