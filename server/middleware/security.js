const getAllowedOrigin = () => process.env.CLIENT_URL || 'http://localhost:3000';

const requireTrustedOrigin = (req, res, next) => {
    const method = req.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return next();
    }

    const origin = req.get('origin');
    if (!origin) {
        return next();
    }

    if (origin !== getAllowedOrigin()) {
        return res.status(403).json({ error: 'Request origin is not allowed' });
    }

    return next();
};

module.exports = {
    requireTrustedOrigin
};
