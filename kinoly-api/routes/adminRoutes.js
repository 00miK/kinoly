// routes/adminRoutes.js
// Routes réservées aux administrateurs.
// protect vérifie le token, restrictTo('admin') vérifie le rôle.
// Les deux middlewares sont appliqués sur TOUTES les routes de ce fichier
// via router.use(), ce qui évite de les répéter sur chaque route.

const express = require('express');
const router  = express.Router();

const { getAllUsers, updateUserRole, deleteUser, getAllMessages } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Application globale des middlewares d'auth sur toutes les routes admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users',              getAllUsers);    // GET    /api/admin/users
router.patch('/users/:id/role',   updateUserRole); // PATCH  /api/admin/users/:id/role
router.delete('/users/:id',       deleteUser);     // DELETE /api/admin/users/:id
router.get('/messages',           getAllMessages); // GET    /api/admin/messages

module.exports = router;
