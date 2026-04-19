# Beakon Server

Express API for Beakon. Handles authentication, link creation/management, analytics aggregation, and short-link redirects.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth in HttpOnly cookies
- Helmet, CORS, rate limiting

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env` from `.env.example`:
   - `cp .env.example .env`
3. Update required values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `SERVER_URL`
4. Run server:
   - Development: `npm run dev`
   - Production: `npm start`

Default local port is `5000`.

## Environment Variables

From `.env.example`:

- `PORT` — server port (default `5000`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — token duration (example: `7d`)
- `CLIENT_URL` — allowed CORS origin (frontend URL)
- `SERVER_URL` — public base URL for generated short links
- `NODE_ENV` — runtime environment

Production example: `CLIENT_URL=https://beakn.lol`, `SERVER_URL=https://api.beakn.lol`.

## Main Routes

- `GET /api/health` — health check
- `POST /api/auth/*` — auth endpoints
- `GET|POST|PATCH|DELETE /api/links/*` — link operations
- `GET /api/analytics/*` — analytics endpoints
- `GET /:shortCode` — redirect handler

## Security/Middleware

- `helmet` for secure headers
- CORS with credentials enabled
- Trusted-origin checks for API routes
- Rate limiting for auth and API routes
- Central error handler middleware

## Notes

- Redirect route is intentionally mounted last so API routes take priority.
