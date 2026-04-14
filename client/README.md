# Beakon Client

React frontend for Beakon. It includes the public landing page, authentication screens, and authenticated analytics/dashboard UI.

## Stack

- React (`react-scripts`)
- React Router
- Axios
- D3 (audience/map visualizations)

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env` (optional but recommended):
   - `REACT_APP_API_URL=http://localhost:5000`
   - `REACT_APP_PUBLIC_BASE_URL=http://localhost:5000` (optional override for displayed short links)
3. Start dev server:
   - `npm start`

App runs on [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm start` — start development server
- `npm run build` — production build
- `npm run eject` — eject CRA config

## Key App Areas

- Landing and guest short-link creation
- Login/Sign-up flows
- Dashboard with link stats
- Link management page
- Analytics + audiences views

## API Integration

- Axios base URL comes from `REACT_APP_API_URL` (fallback: `http://localhost:5000`)
- Auth is cookie-based (`withCredentials: true`)
- Short-link display base can be forced with `REACT_APP_PUBLIC_BASE_URL`

## Notes

- The frontend expects the backend to be running for auth, links, analytics, and redirects.
.