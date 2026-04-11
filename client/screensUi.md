## Beakon — Screen Descriptions (Tailored to UI Style)

---

### Design System Reference (from this UI)

Before prompting each screen, set this as the base style note:

> *"Dark SaaS dashboard. Background: deep navy-slate #0D1117. Sidebar: slightly lighter #131929. Card surfaces: #1A2235 with subtle border. Primary accent: violet #7C5CFC. Secondary accent: cyan #06B6D4 (used for sparklines and trend lines only). Success: emerald green for 'Active' badges. Warning: amber/yellow for 'Paused' badges. Typography: Inter. Monospace: for short codes. Sidebar is 190px wide, fixed. Top bar is fixed. All stat cards have an icon top-right, a large bold white metric, and a subtle trend indicator below it. Tables have no heavy borders — just row hover states."*

---

### Screen 1 — Landing Page

**Top bar:** Beakon logo mark (square violet icon + wordmark) top left, identical to the dashboard logo. Right side: `Log in` ghost button + `Get Started` solid violet button matching the `+ Create Link` button style seen in the UI.

**Hero:** Dark background matching the dashboard's `#0D1117`. Centered layout. Large headline ~56px bold white: *"Know exactly who clicked your link."* Subtitle in slate-400 below: *"Paste any URL. Get a short trackable link. See every click, device, and location in real time."*

Below the headline: a wide input bar styled like a search field — same rounded style as the "Search links…" bar in the top nav, but wider and centered. Placeholder: *"Paste your destination URL…"*. Solid violet `Shorten & Track` button attached to the right end, matching the `+ Create Link` button exactly.

Small helper text below the input in slate-400: *"Free to start. No credit card required."*

**Feature strip below fold:** Three stat-card-styled boxes (same `#1A2235` surface, same subtle border as the dashboard cards) arranged in a row. Each has the icon style from the stat cards (top right). Card 1: cursor/click icon, "Track Any URL", short description. Card 2: bar chart icon, "Real-Time Analytics". Card 3: globe icon, "Geo + Device Breakdown".

---

### Screen 2 — Sign Up / Log In

**Left panel (40% width):** Same `#0D1117` background. Beakon logo centered vertically. Tagline in slate-400 below it. Subtle violet radial glow behind the logo — same glow effect visible on the sidebar active state in the UI.

**Right panel (60% width):** Background `#131929` (matching sidebar tone). Centered card in `#1A2235` with the same border style as the stat cards. Card contains: page title "Create your account" in white bold. Email input + Password input — same styling as the Search bar in the top nav (rounded, dark fill, slate border). Full-width violet `Continue` button matching `+ Create Link` exactly. Below: "Already have an account? Log in" in slate-400 with the link in violet.

---

### Screen 3 — Dashboard (Overview)

**Sidebar:** Identical to the Links screen sidebar. Nav items: Dashboard, Links, Analytics, Audiences. Below a divider: Settings, Docs, Changelog. Active state = violet left border + slight violet background tint, matching what's shown. User avatar card at bottom with name, plan badge in violet (same "Pro Plan" pill style).

**Top bar:** Page title "Dashboard" bold white, subtitle in slate-400: *"Welcome back. Here's what's happening."* Right side: same date range dropdown (`Last 30 days`) + same violet `+ Create Link` button.

**Stat cards row (4 cards):** Same exact card style as shown — `#1A2235` surface, icon top-right in slate tone.
- **Total Clicks** — large bold number, emerald `↑ X%` trend below
- **Active Links** — count, `+X this week` in slate-400 below (exactly like "Active Links" card shown)
- **Links Created This Month** — count, `+X vs last month`
- **Top Performer** — short code in violet monospace, click count in slate-400 below (identical to the "Top Performer" card in the UI)

**Main content:** The same links table as shown — but this Overview version shows only the top 5 rows, with a `View all links →` link in violet below it, pointing to the Links screen.

---

### Screen 4 — Links Screen (exactly as shown)

This screen is already designed. Describe it to Stitch as-is for the other screens' reference. Key details to lock in:

- Table columns: Link (short code in violet mono + destination URL in slate-400 below), Tags (colored pill badges — each tag gets its own muted color), Total Clicks, Unique Visitors, CTR, 30-Day Trend (cyan sparkline), Status (emerald "Active" / amber "Paused" badge), overflow `...` menu
- Tag pills have soft background tints (e.g. violet-tinted for "Campaign", teal for "Event", etc.) — not harsh solid fills
- The sparkline in the Trend column is a small cyan line on a subtle dark surface rectangle — no axes, no labels
- Pagination at bottom right matches exactly: numbered pills, arrows, current page in violet

---

### Screen 5 — Create Link (Slide-over Panel)

**Trigger:** Clicking `+ Create Link` slides in a panel from the right. The main content dims with a dark overlay. Panel width ~480px, background `#1A2235`, left border in violet (same active sidebar style). No full-screen modal — it's a panel so the dashboard context stays visible behind it.

**Panel header:** "Create New Link" in bold white. `✕` close icon top right in slate-400.

**Fields (same input style as search bar):**
- "Destination URL" — full width, placeholder *"https://…"*, required
- "Short code" — shows `bkn.so/` as static slate-400 prefix, editable monospace field after it (auto-generates if left blank)
- "Link title" — optional, plain text
- "Tags" — multi-select input where user types a tag and hits enter; renders as the same colored pill badges seen in the table

**Collapsible section:** "UTM Parameters ›" — expands to show Source, Medium, Campaign fields in the same input style.

**Footer of panel:** Full-width violet `Create Link` button. Below it in slate-400: *"Your link will be live immediately."*

**Success state:** After creation, the fields are replaced by a success confirmation inside the same panel. Shows the new short URL in a large violet mono code block, a copy icon button, and a small QR code thumbnail. Two buttons: `Copy Link` (violet) and `View Analytics` (ghost/outline). This matches the card aesthetic — `#1A2235` surface, subtle border.

---

### Screen 6 — Link Analytics (Detail)

**Sidebar:** Unchanged. Active item: "Analytics".

**Top bar:** Breadcrumb in slate-400: `Links › bkn.so/launch`. Page title: the link's title in bold white. Short URL in a violet monospace pill with a copy icon. Status badge (Active/Paused). Date range dropdown (same as Links screen).

**Stat row (3 cards, wider than the 4-card layout):**
- **Total Clicks** — large violet number, sparkline inside the card (same cyan line but larger)
- **Unique Visitors** — emerald number, `X% of total` in slate-400 below
- **Last Clicked** — relative timestamp ("2 minutes ago"), exact time in slate-400 below

**Main chart (full width card):** Line chart — "Clicks Over Time". Same `#1A2235` card surface. Violet line, very soft violet fill beneath it (low opacity). X-axis = dates in slate-400, Y-axis = numbers. Hover tooltip: dark surface card showing date + exact click count. Built to match the sparkline style but full-size.

**Below chart — 3-column breakdown (same card style):**
- **Top Locations** — list with country flag emoji, country name in white, click count + a violet fill bar (like a mini horizontal bar chart). Same row structure as the links table.
- **Devices** — donut chart. Violet = Mobile, Cyan = Desktop, Emerald = Tablet. Legend below with percentages.
- **Browsers** — donut chart. Same color order. Chrome, Safari, Firefox, Other.

**Bottom section — Clicks Log (full-width card):** Table with columns: Time (relative), Country, City, Device (icon + label), Browser, OS, Referrer (truncated URL or "Direct"). Same table styling as the links table — no heavy borders, row hover states, slate-400 secondary text.

---

### Screen 7 — Audiences (Nav Item Shown)

This is a natural expansion — a screen that aggregates visitor data across *all* links, not just one.

**Top bar:** Title "Audiences". Subtitle: *"Aggregated visitor data across all your links."* Same date range filter.

**Stat row (3 cards):** Total Unique Visitors, Most Active Country, Most Used Device.

**Below stats — 2-column grid:**
- Left (wider): World map heatmap — countries shaded in violet intensity based on click volume. Dark map background. Tooltip on hover shows country + click count.
- Right: Breakdown list — Top 10 countries, same flag + bar style as the Analytics detail screen.

**Bottom row — 2 equal cards:**
- Device breakdown donut (same style)
- Browser breakdown donut (same style)

---

### Screen 8 — Settings

**Sidebar active:** Settings.

**Layout:** Single column, max-width ~680px, centered in the content area. Each section is its own card (`#1A2235`, same border).

**Section 1 — Profile:** Avatar (initials circle, same as sidebar), name field, email field. `Save Changes` violet button.

**Section 2 — Short Domain:** Shows current domain `bkn.so` in a monospace read-only field. Upgrade prompt in slate-400: *"Custom domains available on Pro."* Violet `Upgrade` link.

**Section 3 — API Access:** API key shown obscured (`••••••••••••••••`) with a `Reveal` ghost button and `Regenerate` ghost button beside it. Monospace field style.

**Section 4 — Danger Zone:** Card with a rose/red-tinted border (not violet). `Delete Account` button in rose red outline style. Destructive action warning text in slate-400 below.
