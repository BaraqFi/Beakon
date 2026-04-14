# Beakon — System Architecture

> Last updated: April 2026

---

## 1. What Is Beakon?

Beakon is a full-stack link tracking and shortening platform. It allows anyone — with or without an account — to paste a URL, generate a short trackable link, and share it. Every time that link is clicked, Beakon logs the event and records metadata: timestamp, country, city, device type, browser, OS, and referrer. Registered users get a full analytics dashboard to visualise this data per-link and across their entire account.

The core value proposition is that Beakon works for **any URL on the internet** — not just pages the user owns. You don't need access to the destination site, you don't need to add tracking scripts, and you don't need to be a developer to use it. The tracking happens entirely within Beakon's redirect layer, before the user ever reaches the destination.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (CRA), React Router v6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (via Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcryptjs for password hashing |
| Short code generation | nanoid |
| User agent parsing | ua-parser-js |
| Geo lookup | ip-api.com (free, no API key required) |
| Rate limiting | express-rate-limit |
| Frontend hosting | Vercel |
| Backend hosting | Railway |
| Package manager (client) | pnpm |

---

## 3. Repository Structure

```
Beakon/
├── client/                         # React frontend
│   └── src/
│       ├── components/
│       │   ├── dashboard/          # MetricCard, Sparkline
│       │   ├── layout/             # DashboardLayout, Sidebar, TopNav, Footer
│       │   ├── modals/             # CreateLinkModal, CreateLinkSuccessModal
│       │   └── ui/                 # Badge, EmptyState, Skeleton
│       ├── context/                # AuthContext
│       ├── hooks/                  # useAuth, useLinks, useClipboard
│       ├── pages/                  # LandingPage, Login, SignUp, Links,
│       │                           # Analytics, LinkAnalytics, Audiences,
│       │                           # UserSettings, NotFound
│       └── utils/                  # formatDate, formatNumber, guestLinks
│
└── server/                         # Express backend
    ├── config/                     # DB connection
    ├── controllers/                # Business logic per domain
    ├── middleware/                 # Auth, rate limiting, error handling
    ├── models/                     # Mongoose schemas
    ├── routes/                     # Express routers
    └── utils/                      # Short code gen, geo, UA parsing, IP hashing
```

---

## 4. Data Models

### 4.1 User

```
User {
  _id          ObjectId        (auto)
  email        String          unique, required
  passwordHash String          bcrypt hash, never raw
  name         String          optional display name
  plan         String          enum: ["free", "pro"]  default: "free"
  createdAt    Date            default: now
}
```

### 4.2 Link

```
Link {
  _id          ObjectId        (auto)
  shortCode    String          unique, 6 chars (nanoid), indexed
  originalUrl  String          required — the destination
  title        String          optional user-defined label
  tags         [String]        array of tag strings
  userId       ObjectId | null ref: User — null for guest-created links
  isActive     Boolean         default: true
  expiresAt    Date | null     null for registered users
                               30 days from creation for guest links
  createdAt    Date            default: now
}
```

### 4.3 Click

```
Click {
  _id          ObjectId        (auto)
  linkId       ObjectId        ref: Link, required, indexed
  clickedAt    Date            default: now
  country      String
  city         String
  device       String          enum: mobile | desktop | tablet | unknown
  browser      String          Chrome | Safari | Firefox | Edge | Other
  os           String          Android | iOS | Windows | macOS | Linux | Other
  referrer     String | null   full referrer URL or null (direct)
  ipHash       String          SHA-256 of raw IP — never store raw IP
}
```

---

## 5. API Reference

All API routes are prefixed with `/api`. The redirect route (`/:code`) lives at the root level and is registered last in `index.js`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create account, returns JWT |
| POST | `/api/auth/login` | None | Login, returns JWT |
| POST | `/api/auth/logout` | JWT | Invalidate session (client clears token) |
| GET | `/api/auth/me` | JWT | Returns current user object |

### Links — `/api/links`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/links` | JWT | Get all links for authenticated user |
| POST | `/api/links` | JWT | Create a new tracked link |
| GET | `/api/links/:id` | JWT | Get a single link by ID |
| PATCH | `/api/links/:id` | JWT | Update title, tags, status, or toggle active |
| DELETE | `/api/links/:id` | JWT | Delete a link and its click data |
| POST | `/api/links/guest` | None | Create a guest link (no account required) |
| POST | `/api/links/claim` | JWT | Claim guest links into authenticated account |

### Analytics — `/api/analytics`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/overview` | JWT | Aggregate stats across all user links |
| GET | `/api/analytics/:linkId` | JWT | Per-link stats: total clicks, uniques, trend |
| GET | `/api/analytics/:linkId/clicks` | JWT | Raw click log for a link (paginated) |

### Redirect — `/:code`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:code` | None | Look up short code, log click, redirect to originalUrl |

This route is intentionally public and unauthenticated — it must be reachable by anyone who receives a Beakon link.

---

## 6. Backend Flows

### 6.1 Auth — Register

```
Client POST /api/auth/register { email, password }
  │
  ├─ Validate: email format, password length ≥ 8
  ├─ Check: User.findOne({ email }) — return 409 if exists
  ├─ Hash: bcrypt.hash(password, 10)
  ├─ Save: new User({ email, passwordHash })
  ├─ Sign: jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
  └─ Return: { token, user: { id, email, name, plan } }
```

### 6.2 Auth — Login

```
Client POST /api/auth/login { email, password }
  │
  ├─ Find: User.findOne({ email }) — return 401 if not found
  ├─ Compare: bcrypt.compare(password, user.passwordHash) — return 401 if fail
  ├─ Sign: jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
  └─ Return: { token, user: { id, email, name, plan } }
```

### 6.3 JWT Middleware (verifyToken)

```
Request hits protected route
  │
  ├─ Read: Authorization header → "Bearer <token>"
  ├─ If missing → 401 { error: "No token provided" }
  ├─ Verify: jwt.verify(token, JWT_SECRET)
  ├─ If invalid/expired → 401 { error: "Invalid or expired token" }
  ├─ Attach: req.user = { userId: payload.userId }
  └─ next()
```

### 6.4 Create Link (Authenticated)

```
Client POST /api/links { originalUrl, title?, tags?, customCode? }
  │
  ├─ verifyToken middleware → req.user.userId available
  ├─ Validate: originalUrl is a valid URL format
  ├─ Short code:
  │     if customCode provided:
  │       check Link.findOne({ shortCode: customCode })
  │       return 409 if taken
  │     else:
  │       generateShortCode() — nanoid(6), loop until no collision
  ├─ Save: new Link({ shortCode, originalUrl, title, tags, userId, isActive: true })
  └─ Return: { link } — full link object
```

### 6.5 Create Link (Guest — No Auth)

```
Client POST /api/links/guest { originalUrl, title?, tags? }
  │
  ├─ No auth required
  ├─ Validate: originalUrl
  ├─ Generate: shortCode via nanoid(6) — no custom codes for guests
  ├─ Save: new Link({
  │     shortCode,
  │     originalUrl,
  │     userId: null,                    ← no user attached
  │     expiresAt: Date.now() + 30days   ← guest links expire
  │   })
  └─ Return: { link }
      Client stores full link object in localStorage under 'beakon_guest_links'
```

### 6.6 Claim Guest Links (On Signup)

```
Client POST /api/links/claim { shortCodes: ["abc123", "xyz789"] }
  │
  ├─ verifyToken middleware → req.user.userId
  ├─ For each shortCode:
  │     Link.findOneAndUpdate(
  │       { shortCode, userId: null },   ← only unclaimed links
  │       { userId: req.user.userId, expiresAt: null },  ← attach + remove expiry
  │       { new: true }
  │     )
  ├─ Count how many were successfully claimed
  └─ Return: { claimed: N }
      Client clears localStorage guest links
      Client shows banner: "N links from your session have been added to your account."
```

### 6.7 The Redirect Flow (Core Feature)

```
User clicks bkn.so/abc123
  │
  ├─ Rate limiter middleware — max 60 req/min per IP
  │
  ├─ Link.findOne({ shortCode: "abc123", isActive: true })
  ├─ If not found → redirect to CLIENT_URL/404
  ├─ If found but expiresAt < now → redirect to CLIENT_URL/expired
  │
  ├─ res.redirect(301, link.originalUrl)   ← user is on their way immediately
  │
  └─ trackClick(link._id, req) — runs async, does NOT block the redirect
        │
        ├─ Extract IP from x-forwarded-for header (Railway/Vercel proxy)
        ├─ hashIP(ip) → SHA-256 hex string
        ├─ parseUserAgent(req.headers['user-agent'])
        │     → { device, browser, os }
        ├─ getGeoData(ip) → fetch("http://ip-api.com/json/" + ip)
        │     → { country, city }
        │     → on failure: { country: "Unknown", city: "Unknown" }
        └─ Click.create({ linkId, clickedAt, country, city,
                          device, browser, os, referrer, ipHash })
```

The redirect happens before geo/UA lookups complete. The user never waits for tracking.

### 6.8 Fetch Analytics (Per Link)

```
Client GET /api/analytics/:linkId
  │
  ├─ verifyToken middleware
  ├─ Verify: Link.findOne({ _id: linkId, userId: req.user.userId })
  │     → return 403 if link doesn't belong to this user
  │
  ├─ Parallel queries:
  │     totalClicks:    Click.countDocuments({ linkId })
  │     uniqueVisitors: Click.distinct('ipHash', { linkId }).then(arr => arr.length)
  │     lastClick:      Click.findOne({ linkId }).sort({ clickedAt: -1 })
  │     clicksByDate:   Click.aggregate([
  │                       { $match: { linkId } },
  │                       { $group: { _id: { $dateToString: { format: "%Y-%m-%d",
  │                                  date: "$clickedAt" } }, count: { $sum: 1 } } },
  │                       { $sort: { _id: 1 } }
  │                     ])
  │     byCountry:      Click.aggregate([ $match, $group by country, $sort, $limit 10 ])
  │     byDevice:       Click.aggregate([ $match, $group by device ])
  │     byBrowser:      Click.aggregate([ $match, $group by browser ])
  │
  └─ Return: { totalClicks, uniqueVisitors, lastClick,
               clicksByDate, byCountry, byDevice, byBrowser }
```

### 6.9 Delete Link

```
Client DELETE /api/links/:id
  │
  ├─ verifyToken middleware
  ├─ Verify: Link.findOne({ _id, userId: req.user.userId }) → 403 if not owner
  ├─ Delete link:   Link.findByIdAndDelete(id)
  ├─ Delete clicks: Click.deleteMany({ linkId: id })   ← cascade delete
  └─ Return: { message: "Link deleted" }
```

---

## 7. Middleware Chain

Every request passes through middleware in this order:

```
Request
  │
  ├─ cors()                     — allow requests from CLIENT_URL only
  ├─ express.json()             — parse request body
  ├─ rateLimit (route-specific) — applied per router, not globally
  │     redirect route:  60 req/min per IP
  │     auth routes:     10 req/min per IP (brute force protection)
  │     api routes:      120 req/min per IP
  │
  ├─ Route handler
  │     └─ verifyToken (on protected routes only)
  │           └─ Controller function
  │
  └─ errorHandler()             — catches anything thrown upstream
        └─ Returns { error: message } with appropriate status code
```

---

## 8. Guest User Architecture

Beakon supports three user states:

```
┌─────────────┐     signs up      ┌─────────────────┐
│    Guest     │ ───────────────▶  │   Registered    │
│              │   /links/claim    │                 │
│ Links in     │   merges data     │ Links in MongoDB│
│ localStorage │                  │ Full analytics  │
│ No analytics │                  │ No expiry       │
└─────────────┘                   └─────────────────┘
      │
      │ link created via POST /api/links/guest
      │ stored in MongoDB with userId: null, expiresAt: +30 days
      │
      ▼
  Click data is tracked in MongoDB regardless of guest/registered status.
  Guest users simply cannot call the /api/analytics routes (JWT required).
  Their click data exists — it becomes visible the moment they claim their links.
```

This creates a natural conversion hook: a guest user who has received clicks on their link is shown a prompt — *"Your link has been clicked. Sign up to see the data."*

---

## 9. Security Considerations

| Concern | Approach |
|---|---|
| Password storage | bcrypt with cost factor 10 — never store plaintext |
| IP addresses | SHA-256 hashed immediately on receipt — raw IP never persisted |
| JWT secret | Stored in `.env`, never committed — rotate if exposed |
| Token storage (client) | localStorage for now — migrate to httpOnly cookie in production |
| CORS | Restricted to `CLIENT_URL` env variable — not wildcard `*` |
| Rate limiting | Auth routes: 10/min. Redirect: 60/min. API: 120/min |
| Route ownership | Every analytics/link query filters by `userId: req.user.userId` — users can never access another user's data even with a valid token |
| Guest link claiming | `POST /api/links/claim` only claims links where `userId: null` — registered links cannot be hijacked |

---

## 10. Environment Variables

```bash
# Server
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/beakon
JWT_SECRET=<random 256-bit string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Client
REACT_APP_API_URL=http://localhost:5000
```

---

## 11. Build & Run

```bash
# Install dependencies
cd server && npm install

# Development (with hot reload)
npm run dev        # uses nodemon

# Production
npm start          # node index.js
```

---

## 12. Deployment

| Service | What it hosts |
|---|---|
| Vercel | React client — auto-deploys on push to main |
| Railway | Express server — auto-deploys on push to main |
| MongoDB Atlas | Database — M0 free tier, upgrade as needed |

Environment variables are set in Railway's dashboard for the server and in Vercel's project settings for the client. Neither `.env` file is committed to the repository.
