// routes/movieRoutes.js
// Routes CRUD pour les films.
// Les routes publiques (GET) n'exigent pas de token.
// Les routes d'écriture (POST, PUT, DELETE) requièrent protect.

const express = require('express');
const router = express.Router();

const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  uploadPoster,
} = require('../controllers/movieController');

const { protect }       = require('../middlewares/authMiddleware');
const validate          = require('../middlewares/validate');
const { handleUpload }  = require('../middlewares/upload');
const {
  createMovieSchema,
  updateMovieSchema,
} = require('../middlewares/schemas/movieSchemas');

// Routes publiques
router.get('/',    getAllMovies);   // GET /api/movies
router.get('/:id', getMovieById);  // GET /api/movies/:id

// Routes protégées (token requis)
router.post('/',    protect, validate(createMovieSchema), createMovie);   // POST   /api/movies
router.put('/:id',  protect, validate(updateMovieSchema), updateMovie);   // PUT    /api/movies/:id
router.delete('/:id', protect, deleteMovie);                              // DELETE /api/movies/:id

// Upload d'affiche : handleUpload('poster') gère multer + ses erreurs,
// puis uploadPoster() met à jour poster_url en base.
router.post('/:id/poster', protect, handleUpload('poster'), uploadPoster); // POST /api/movies/:id/poster

module.exports = router;
