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

## Available Docs

- `client/README.md` — frontend details
- `server/README.md` — backend/API details
