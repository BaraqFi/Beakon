const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateMe, deleteMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout (protected)
router.post('/logout', verifyToken, logout);

// GET /api/auth/me (protected)
router.get('/me', verifyToken, getMe);

// PATCH /api/auth/me (protected)
router.patch('/me', verifyToken, updateMe);

// DELETE /api/auth/me (protected)
router.delete('/me', verifyToken, deleteMe);

module.exports = router;
