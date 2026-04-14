const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const { requireTrustedOrigin } = require('./middleware/security');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');

const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    })
  );
  app.use(requireTrustedOrigin);

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authLimiter, require('./routes/auth'));
  app.use('/api/links', apiLimiter, require('./routes/links'));
  app.use('/api/analytics', apiLimiter, require('./routes/analytics'));
  app.use('/', require('./routes/redirect'));

  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use(errorHandler);

  return app;
};

module.exports = createApp;
