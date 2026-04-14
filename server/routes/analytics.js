const express = require('express');
const router = express.Router();
const { getAccountOverview, getLinkAnalytics, getRawClickLog } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

// Note: /overview is placed before /:linkId to avoid matching 'overview' as a MongoDB parameter

// GET /api/analytics/overview
router.get('/overview', verifyToken, getAccountOverview);

// GET /api/analytics/:linkId
router.get('/:linkId', verifyToken, getLinkAnalytics);

// GET /api/analytics/:linkId/clicks
router.get('/:linkId/clicks', verifyToken, getRawClickLog);

module.exports = router;
