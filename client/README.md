# Beakon Client

React frontend for Beakon. Includes the public landing page, authentication screens, and the authenticated analytics dashboard.

## Stack

- React (`react-scripts`)
- React Router
- Axios
- D3 (charts and map visualizations)

## Setup

1. Install dependencies:
   - `pnpm install`
2. Create `.env.local`:
   - `REACT_APP_API_URL=http://localhost:5000`
   - `REACT_APP_PUBLIC_BASE_URL=http://localhost:5000` (optional — overrides displayed short link base)
3. Start dev server:
   - `pnpm start`

App runs on [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm start` — start development server
- `pnpm run build` — production build
- `pnpm run lint` — run ESLint
- `pnpm run check:env` — validate required env vars

## Key App Areas

- Landing page with product overview
- Login / Sign-up flows
- Dashboard with link stats and recent links
- Link management (create, delete, toggle status)
- Analytics with aggregated breakdowns (locations, devices, browsers)
- Audience insights with interactive world map

## API Integration

- Axios base URL from `REACT_APP_API_URL` (fallback: `http://localhost:5000`)
- Auth is cookie-based (`withCredentials: true`)
- Short-link display base can be overridden with `REACT_APP_PUBLIC_BASE_URL`

## Notes

- The frontend requires the backend to be running for auth, links, analytics, and redirects.
