const rateLimit = require('express-rate-limit');

// Redirect limiter: max 60 req/min per IP. Ensures people don't bot-farm click counts.
const redirectLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, 
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// Auth limiter: max 10 req/min per IP. Protection against brute force password attacks.
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 10,
    message: { error: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// API limiter: standard limit on other endpoints to prevent heavy DB scraping
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 120,
    message: { error: 'API rate limit exceeded.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    redirectLimiter,
    authLimiter,
    apiLimiter
};
