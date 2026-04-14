const express = require('express');
const router = express.Router();
const { handleRedirect } = require('../controllers/redirectController');
const { redirectLimiter } = require('../middleware/rateLimit');

// GET /:code
// Applies strict redirect rate limiter specifically per IP
router.get('/:code', redirectLimiter, handleRedirect);

module.exports = router;
