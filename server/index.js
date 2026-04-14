require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { requireTrustedOrigin } = require('./middleware/security');

const { apiLimiter, authLimiter } = require('./middleware/rateLimit');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required');
    process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true // essential to allow reading http-only cookies
}));
app.use(requireTrustedOrigin);

// Basic test route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Platform operational' });
});

// Core API Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/links', apiLimiter, require('./routes/links'));
app.use('/api/analytics', apiLimiter, require('./routes/analytics'));

// The redirect route comes last!
app.use('/', require('./routes/redirect'));

// Missing route handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Beakon server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
