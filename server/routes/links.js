const express = require('express');
const router = express.Router();
const {
    getLinks,
    createLink,
    createGuestLink,
    claimGuestLinks,
    getLink,
    updateLink,
    deleteLink
} = require('../controllers/linksController');
const { verifyToken } = require('../middleware/auth');

// Note: Order is critical here so that /guest and /claim don't get swallowed by /:id param bounds

// POST /api/links/guest
router.post('/guest', createGuestLink);

// POST /api/links/claim
router.post('/claim', verifyToken, claimGuestLinks);

// GET /api/links
router.get('/', verifyToken, getLinks);

// POST /api/links
router.post('/', verifyToken, createLink);

// GET /api/links/:id
router.get('/:id', verifyToken, getLink);

// PATCH /api/links/:id
router.patch('/:id', verifyToken, updateLink);

// DELETE /api/links/:id
router.delete('/:id', verifyToken, deleteLink);

module.exports = router;
