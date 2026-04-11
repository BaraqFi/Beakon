## Beakon — Frontend UI Flow & Interaction Map

---

### Global Rules (Mock Layer)
- Auth state lives in **React Context** (`AuthContext`) — a simple boolean `isLoggedIn` + a mock user object
- All form submissions that would hit an API just call `setTimeout(1500)` to simulate loading, then update state
- Link data comes from a **mock data file** (`mockLinks.js`) — an array of 8–10 hardcoded link objects with realistic numbers
- No routing guards needed yet — just redirect logic in the mock auth functions
- Use **React Router v6** for all navigation

---

### Screen 1 — Landing Page (`/`)

```
[Navbar]
  Logo (Beakon)          → onClick: navigate("/")
  "Log in" button        → onClick: navigate("/login")
  "Get Started" button   → onClick: navigate("/signup")

[Hero Section]
  URL input field        → onChange: updates local state (urlInput)
  "Shorten & Track" btn  → onClick:
                            if input empty → shake input, show inline error
                            if input filled → navigate("/signup?url=" + urlInput)
                            (saves the URL to sessionStorage so signup can pick it up)

[Feature cards]          → static, no interaction

[Footer links]
  "Log in"               → navigate("/login")
  "Sign up"              → navigate("/signup")
  "Docs"                 → # (placeholder)
```

---

### Screen 2 — Sign Up (`/signup`)

```
[Form]
  Email input            → onChange: updates local state
  Password input         → onChange: updates local state
  Confirm Password input → onChange: updates local state

  "Continue" button      → onClick:
                            1. Validate: all fields filled, passwords match
                            2. If invalid → show inline field errors (red border + message)
                            3. If valid →
                               a. setLoading(true) — button shows spinner
                               b. setTimeout(1200) — mock API call
                               c. setIsLoggedIn(true) in AuthContext
                               d. Set mock user object { name: "Alex Morgan", plan: "Free" }
                               e. navigate("/dashboard/links")

  "Log in" link          → navigate("/login")

[Social button - optional]
  "Continue with Google" → same mock flow as above, skip to step (b)
```

---

### Screen 3 — Log In (`/login`)

```
[Form]
  Email input            → onChange: updates local state
  Password input         → onChange: updates local state

  "Continue" button      → onClick:
                            1. Validate: fields not empty
                            2. If empty → inline errors
                            3. If filled (ANY value accepted — mock):
                               a. setLoading(true)
                               b. setTimeout(1200)
                               c. setIsLoggedIn(true)
                               d. navigate("/dashboard/links")

  "Sign up" link         → navigate("/signup")
  "Forgot password"      → show inline text: "Password reset coming soon." (no new screen)
```

---

### Screen 4 — Dashboard / Links (`/dashboard/links`)

```
[Sidebar]
  Logo / wordmark        → navigate("/dashboard/links")
  "Dashboard"            → navigate("/dashboard")
  "Links"                → navigate("/dashboard/links")   ← active on this screen
  "Analytics"            → navigate("/dashboard/analytics")
  "Audiences"            → navigate("/dashboard/audiences")
  ── divider ──
  "Settings"             → navigate("/dashboard/settings")
  "Docs"                 → # (placeholder)
  "Changelog"            → # (placeholder)
  User card (bottom)     → no action (static display of mock user)

[Top Bar]
  Date range dropdown    → onClick: opens a small dropdown menu
                            Options: Last 7 days / Last 30 days / All time
                            Selecting an option → updates local state (dateRange)
                            (stat cards re-render with slightly different mock numbers per range)

  Search bar             → onChange: filters the links table rows client-side
                            (filters mock data by short code or destination URL)

  "+ Create Link" btn    → onClick: opens the Create Link slide-over panel
                            (sets showCreatePanel(true) in local state)

[Stat Cards]             → all static/mock, no click action

[Links Table]
  Each table row         → onClick (anywhere on row except action buttons):
                            navigate("/dashboard/analytics/" + link.shortCode)

  Copy icon (per row)    → onClick:
                            navigator.clipboard.writeText("bkn.so/" + shortCode)
                            Icon swaps to a checkmark for 2 seconds, then back

  Analytics icon (row)   → onClick: navigate("/dashboard/analytics/" + link.shortCode)

  "..." overflow menu    → onClick: opens a small 3-item dropdown inline:
                            • "Edit" → opens Edit panel (same slide-over as Create, pre-filled)
                            • "Pause / Activate" → toggles status badge in mock state
                            • "Delete" → shows inline confirm prompt on the row:
                              "Delete this link? [Cancel] [Delete]"
                              Confirm → removes from mock array, row disappears

  Status badge (toggle)  → onClick: toggles Active ↔ Paused in mock state
                            Badge color updates immediately

  Tag pill (per row)     → onClick: filters table to show only rows with that tag
                            (same as typing the tag name in the search bar)

[Pagination]
  Page number buttons    → onClick: updates currentPage state
                            Table re-renders showing next 8 mock rows
                            (cycle through same mock data or show empty state)
```

---

### Screen 5 — Create Link Panel (slide-over, triggered from Links screen)

```
[Panel overlay]
  Background dim         → onClick: closes panel (setShowCreatePanel(false))
  "✕" close button       → onClick: closes panel

[Form]
  "Destination URL"      → onChange: updates local state
  "Short code" field     → onChange: updates local state
                            if empty on submit → auto-generate 6-char mock code
  "Link title"           → onChange: updates local state
  Tag input              → onKeyDown (Enter): adds tag pill to local array
  Tag pill "✕"           → onClick: removes that tag from array
  "UTM Parameters ›"     → onClick: toggles expanded/collapsed state
    └ UTM fields         → onChange: update local state (no real effect in mock)

  "Create Link" button   → onClick:
                            1. Validate: destination URL not empty
                            2. If empty → red border on URL field
                            3. If valid:
                               a. setLoading(true) — button spinner
                               b. setTimeout(1200)
                               c. Build new mock link object from form state
                               d. Prepend to mockLinks array in local state
                               e. Switch panel to SUCCESS STATE:
                                  • Show new short URL in violet mono block
                                  • "Copy Link" button → clipboard copy + checkmark
                                  • "View Analytics" button → navigate to analytics
                                    screen for the new link + close panel
                                  • Small QR code placeholder (static image or
                                    generated with a free QR lib like `qrcode.react`)

  "Create another"       → onClick: resets form back to empty state within same panel
```

---

### Screen 6 — Link Analytics (`/dashboard/analytics/:shortCode`)

```
[Top Bar]
  Breadcrumb "Links ›"   → onClick: navigate("/dashboard/links")
  Short URL copy icon    → onClick: clipboard copy + 2s checkmark
  Date range dropdown    → same behavior as Links screen dropdown
                            (mock stat numbers change per range)
  Status badge           → onClick: toggle Active ↔ Paused (mock)

[Stat Cards]             → static mock numbers, no click action

[Clicks Over Time chart] → hover: tooltip shows date + click count (Recharts built-in)
                            (chart data is a static mock array of ~30 data points)

[Top Locations list]
  Country rows           → no click (static)

[Devices donut]          → hover: shows percentage tooltip (Recharts built-in)
[Browsers donut]         → hover: shows percentage tooltip (Recharts built-in)

[Clicks Log table]
  Rows                   → static mock data, no click action
  Table is scrollable    → overflow-y within the card

[Back button / breadcrumb] → navigate("/dashboard/links")
```

---

### Screen 7 — Analytics Overview (`/dashboard/analytics`)

```
  (This is the top-level analytics page — aggregated across all links)

[Stat cards]             → static mock
[World map]              → hover on country: tooltip with click count
                            (use a free lib like `react-simple-maps`)
[Top countries list]     → static mock
[Device donut]           → Recharts hover tooltip
[Browser donut]          → Recharts hover tooltip
```

---

### Screen 8 — Audiences (`/dashboard/audiences`)

```
[All content]            → static mock data, no interactive functions
                            (this screen exists visually, no logic needed yet)
```

---

### Screen 9 — Settings (`/dashboard/settings`)

```
[Profile section]
  Name / email fields    → onChange: update local state (pre-filled with mock user)
  "Save Changes" btn     → onClick:
                            setLoading(true) → setTimeout(1000) →
                            show success toast: "Profile updated" (top-right toast)

[API Key section]
  "Reveal" button        → onClick: toggles key visible/hidden (local state)
  "Regenerate" button    → onClick: replaces with new random mock string

[Danger Zone]
  "Delete Account" btn   → onClick:
                            Step 1: show inline confirm UI (same row, no modal):
                            "Type DELETE to confirm: [input] [Confirm] [Cancel]"
                            Step 2: if input === "DELETE":
                               setIsLoggedIn(false)
                               clear AuthContext
                               navigate("/")

[Sidebar logout]
  User card at bottom    → onClick: opens a tiny 2-item popover:
                            • "Profile" → navigate("/dashboard/settings")
                            • "Log out" → setIsLoggedIn(false) → navigate("/")
```

---

### Global Components

```
[Toast notifications]    → triggered by: copy success, link creation, save changes
                            Library: `react-hot-toast` (lightweight, free)
                            Position: top-right, dark surface style matching UI

[Loading spinner]        → on all form "Continue" / "Create" / "Save" buttons
                            Button text replaced by a spinner during setTimeout mock

[Empty state]            → if mockLinks array is empty (user deleted all):
                            Centered card in the table area:
                            Chain link icon, "No links yet"
                            Violet "Create your first link" button
                            → onClick: opens Create Link panel
```

---

### Route Map Summary

```
/                          → Landing page
/signup                    → Sign up
/login                     → Log in
/dashboard                 → redirects to /dashboard/links
/dashboard/links           → Links screen (main dashboard)
/dashboard/analytics       → Analytics overview (all links)
/dashboard/analytics/:code → Single link analytics
/dashboard/audiences       → Audiences screen
/dashboard/settings        → Settings
*                          → 404 page (simple dark card, "Page not found", back button)
```

---

This is everything a developer needs to wire up a fully navigable, demo-ready UI with zero backend. Every interaction is defined, every dead end is accounted for, and swapping the mock functions for real API calls later is just a matter of replacing the `setTimeout` blocks with actual `axios` or `fetch` calls.