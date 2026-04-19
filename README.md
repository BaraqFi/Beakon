# Beakon

Beakon is a full-stack link tracking platform. It lets users create short links, redirect traffic through the backend, and view click analytics (dashboard, per-link analytics, and audience insights).

## Project Structure

- `client/` — React frontend (landing page, auth, dashboard, analytics UI)
- `server/` — Express + MongoDB API (auth, links, analytics, redirect)

## Tech Stack

- Frontend: React, React Router, Axios, D3
- Backend: Node.js, Express, MongoDB (Mongoose), JWT (HttpOnly cookies)

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB connection string

## Quick Start

1. Install dependencies:
   - `cd client && npm install`
   - `cd ../server && npm install`
2. Configure environment:
   - Copy `server/.env.example` to `server/.env`
   - Update values (`MONGO_URI`, `JWT_SECRET`, and URLs)
3. Start backend:
   - `cd server && npm run dev`
4. Start frontend in a second terminal:
   - `cd client && npm start`
5. Open [http://localhost:3000](http://localhost:3000)

## Default Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Redirect host (short links): `http://localhost:5000/<shortCode>`

## Environment Notes

The backend controls public short-link generation via `SERVER_URL`.

The frontend uses:
- `REACT_APP_API_URL` for API calls
- Optional `REACT_APP_PUBLIC_BASE_URL` to override displayed short-link base URL

## CI/CD (GitHub Actions)

Workflows are in `.github/workflows/`:

- `ci.yml`
  - Runs on PRs and pushes to `main`
  - Server: install, env check, lint, test
  - Client: install, env check, lint, build

- `cd.yml`
  - Runs only after `CI` succeeds on `main`
  - SSH deploys to EC2, installs deps, builds client, restarts PM2 process
  - Performs health check with retries

### Required Deployment Secrets

Set these in GitHub repository secrets:

- `EC2_HOST` (e.g. `17.32.298.16` or `ec2-17-32-298-16.eu-north-1.compute.amazonaws.com`)
- `EC2_USER` (e.g. `ec2-user`)
- `EC2_SSH_KEY`
- `EC2_APP_DIR` (e.g. `/home/ec2-user/beakon`)
- `PM2_PROCESS_NAME` (e.g. `beakon-server`)
- `HEALTHCHECK_URL` — e.g. `https://api.beakn.lol/api/health`

### Production URLs

- **Frontend:** `https://beakn.lol`
- **API:** `https://api.beakn.lol`
- **Health:** `https://api.beakn.lol/api/health`

## Available Docs

- `client/README.md` — frontend details
- `server/README.md` — backend/API details
