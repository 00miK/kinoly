// routes/reviewRoutes.js
// Routes CRUD pour les critiques.
// Toutes les routes nécessitent d'être connecté (protect).

const express = require('express');
const router = express.Router();

const {
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect } = require('../middlewares/authMiddleware');
const validate    = require('../middlewares/validate');
const {
  createReviewSchema,
  updateReviewSchema,
} = require('../middlewares/schemas/movieSchemas');

router.post('/',    protect, validate(createReviewSchema), createReview);  // POST   /api/reviews
router.put('/:id',  protect, validate(updateReviewSchema), updateReview);  // PUT    /api/reviews/:id
router.delete('/:id', protect, deleteReview);                              // DELETE /api/reviews/:id

module.exports = router;
