const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Authentication is not configured' });
    }

    // We strictly look for the token in cookies as mandated by our security architecture
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId: '...' }
        next();
    } catch (error) {
        let msg = 'Invalid or expired token.';
        if (error.name === 'TokenExpiredError') {
            msg = 'Your session has expired, please log in again.';
        }
        return res.status(401).json({ error: msg });
    }
};

module.exports = { verifyToken };
