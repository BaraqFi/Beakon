# Beakon Server

Express API for Beakon. Handles authentication, link creation/management, analytics aggregation, and short-link redirects.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth in HttpOnly cookies
- Helmet, CORS, rate limiting

## Setup

1. Install dependencies:
   - `pnpm install`
2. Create `.env` from `.env.example`:
   - `cp .env.example .env`
3. Update required values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `SERVER_URL`
4. Run server:
   - Development: `pnpm dev`
   - Production: `pnpm start`

Default local port is `5000`.

## Environment Variables

From `.env.example`:

- `PORT` — server port (default `5000`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — token duration (e.g. `7d`)
- `CLIENT_URL` — allowed CORS origin (frontend URL)
- `SERVER_URL` — public base URL for generated short links
- `NODE_ENV` — runtime environment

Production example: `CLIENT_URL=https://beakn.lol`, `SERVER_URL=https://api.beakn.lol`.

## Main Routes

- `GET /api/health` — health check
- `POST /api/auth/*` — auth endpoints
- `GET|POST|PATCH|DELETE /api/links/*` — link CRUD
- `GET /api/analytics/overview` — aggregated analytics across all links
- `GET /api/analytics/:linkId` — per-link analytics
- `GET /api/analytics/:linkId/clicks` — paginated click log
- `GET /:shortCode` — redirect handler

## Security

- `helmet` for secure headers
- CORS with credentials enabled
- Trusted-origin checks for API routes
- Rate limiting on auth and API routes
- Central error handler middleware

## Notes

- Redirect route is mounted last so API routes take priority.
