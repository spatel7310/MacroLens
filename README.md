# MacroLens

A real-time macroeconomic dashboard and deal analysis toolkit built for real estate investors. MacroLens pulls together the data points that actually move real estate decisions — interest rates, the yield curve, labor market health, recession signals, and live housing indicators — and pairs them with on-the-spot deal underwriting tools so an investor can sanity-check a property the moment they walk out of a showing.

## What It Does

MacroLens is organized as a single-page dashboard with focused sections. Each one is designed to answer a specific question an investor asks during a normal week.

### Macro Intelligence

- **Fed Tracker** — Current federal funds rate, recent FOMC decisions, and the market-implied path for upcoming meetings. Answers "what is the cost of money doing, and where is it headed?"
- **Yield Curve** — Live Treasury curve across the full maturity spectrum with 2Y/10Y and 3M/10Y spreads charted historically. Inversion is the single most reliable recession signal; this section makes it visible at a glance.
- **Labor Market** — Non-farm payrolls, unemployment rate trend, jobless claims, and wage growth. Housing demand is downstream of employment, so this is a leading indicator for rents and absorption.
- **Macro Snapshot** — CPI, PCE, GDP growth, consumer sentiment, and the VIX in a compact grid. The broad "is the economy healthy?" view.
- **Market Health** — Major indices and sector performance via Finnhub, with a focus on REITs, homebuilders, and regional banks — the equities most correlated with private real estate.
- **Real Estate Signals** — Housing starts, existing home sales, median prices, mortgage application volume, and the live 30Y mortgage rate. The direct housing read.

### Decision Tools

- **Deal Analyzer** — Full underwriting for a target property: purchase price, rehab, financing assumptions, rents, operating expenses, and exit. Outputs cap rate, cash-on-cash, DSCR, IRR, and a break-even sensitivity view. Expense defaults are tunable by property type (new construction vs. value-add vs. older stock) because one-size-fits-all expense ratios are misleading.
- **SFR Calculator** — A lighter single-family rental screen for the "is this even worth a full model?" pass. Gives a 1% rule check, rent-to-price ratio, and rough monthly cash flow at the current live mortgage rate.
- **Alerts Panel** — User-defined thresholds on any data point the app tracks (e.g., "tell me when the 10Y crosses 5%" or "alert on 2/10 re-inversion"). Rules persist in local storage.
- **Economic Calendar** — Upcoming releases (CPI, FOMC, NFP, PCE, retail sales) with expected vs. prior values so an investor knows which days could move rates before they sign anything.
- **Curated News** — Filtered news feed focused on housing, rates, and macro — not general market noise.

### Design Priorities

- **Fast read.** Every section is built to be scannable in under ten seconds. Numbers first, charts second, prose last.
- **Mobile first.** The common use case is pulling the app up during a property walk-through on a phone.
- **Dark, calm, dense.** A muted void palette with Framer Motion micro-interactions — informative without being loud.

## Tech Stack

MacroLens is a TypeScript monorepo with an npm workspaces layout: a React client and an Express API server.

### Client (`client/`)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **React 19** | Latest concurrent features, stable compiler story |
| Build | **Vite 6** | Instant HMR, minimal config, first-class TS |
| Language | **TypeScript 5.6** | End-to-end typing with the server |
| Styling | **Tailwind CSS 4** (via `@tailwindcss/vite`) | Token-driven design, zero CSS file sprawl |
| State (server) | **TanStack Query v5** | Caching, refetch intervals, and WebSocket-friendly invalidation for live data |
| State (client) | **Zustand 5** | Tiny, unopinionated store for UI state (saved deals, alert rules, theme) |
| Charts | **Recharts 2** | Composable React primitives, good enough for everything the dashboard needs |
| Motion | **Framer Motion 11** | Section transitions and purposeful micro-animations |
| PWA | **vite-plugin-pwa** | Installable on iOS/Android; groundwork for offline caching and web push |

### Server (`server/`)

| Layer | Choice | Why |
| --- | --- | --- |
| Runtime | **Node.js** (ESM) | — |
| Framework | **Express 5** | Small surface area, fast to iterate |
| Dev loop | **tsx watch** | TypeScript execution without a separate build step |
| Realtime | **ws** | Raw WebSocket channel for pushing live quotes and rate updates to the client |
| Caching | **node-cache** | In-memory TTL cache in front of every upstream API — FRED and Finnhub rate limits are the binding constraint |
| Config | **dotenv** | API keys and environment config |

### Data Sources

- **FRED (Federal Reserve Economic Data)** — Rates, yield curve, labor market series, CPI/PCE, GDP, housing starts, sentiment. The backbone of everything on the macro side.
- **Finnhub** — Equity quotes, REIT and homebuilder prices, news, and the economic calendar.
- **Treasury / mortgage rate feeds** — Live 30Y mortgage rate used by the deal tools.

Upstream calls are routed through dedicated service modules (`server/src/services/fred.ts`, `finnhub.ts`) and cached before they reach route handlers, so the client can poll aggressively without burning quota.

### Repository Layout

```
MacroLens/
├── client/                # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── sections/  # One file per dashboard section
│       │   ├── layout/
│       │   └── ui/
│       ├── hooks/         # Data-fetching and subscription hooks
│       ├── stores/        # Zustand stores
│       ├── lib/           # Formatters, math, API client
│       └── theme/
├── server/                # Express API
│   └── src/
│       ├── routes/        # fed, yieldCurve, labor, macro, market,
│       │                  # realEstate, deal, calendar, news, history
│       ├── services/      # fred, finnhub, cache
│       └── websocket/     # Live-price push channel
├── docs/                  # Calculator methodology notes
└── scripts/
```

## Running Locally

Prerequisites: Node 20+ and API keys for FRED and Finnhub.

```bash
# Install
npm install

# Environment (server/.env)
FRED_API_KEY=...
FINNHUB_API_KEY=...

# Dev — runs client and server together
npm run dev

# Or individually
npm run dev:client   # Vite on :5173
npm run dev:server   # Express on :3001

# Production build
npm run build
npm start
```

## Future Plans

### Near-term (V2)

- **Watchlist** — Saved tickers (REITs, homebuilders, regional banks) with at-a-glance quotes. Natural extension of the existing Finnhub integration.
- **Deal Comparisons** — Side-by-side view of 2–3 saved deals. Saved deals already persist in local storage, so this is mostly a UI layer.
- **Mortgage Calculator** — Minimal monthly-payment tool with the live 30Y rate auto-filled, for fast affordability checks at a showing.
- **Snapshot Sharing** — Export a deal analysis or market snapshot as an image/PDF to text to a partner or investor.
- **Recession Probability Score** — Composite 0–100 index combining the yield curve, unemployment trend, consumer sentiment, and VIX into one number.
- **Historical Event Markers** — Overlay rate cuts, the COVID crash, SVB, etc. on long-range charts to give context to the lines.
- **True OLED Dark Mode** — A pure `#000` variant for AMOLED phones.
- **Offline Caching** — Leverage the installed PWA plugin so the last good snapshot is available on a plane or in a dead zone.

### Push Notifications

- **Web Push** — Service worker + `web-push` on the server; existing alert rules trigger notifications on Android Chrome and iOS Safari 16.4+. No app store required.
- **Native Push (later)** — Wrap the PWA in Capacitor or Expo for APNs/FCM, only if native features (haptics, widgets, background refresh) become worth the overhead.

### V3 / Ambitious

- **AI Deal Summary** — Feed deal analyzer outputs plus local market data into an LLM for a plain-English analysis paragraph the user can paste into a partner thread.
- **Portfolio Stress Test** — "What happens to my deals if rates hit 8%?" Scenario modeling against the live macro baseline.
- **Multi-Property Dashboard** — Graduate from per-deal napkin math to managing a small portfolio with aggregate cash flow, leverage, and exposure views.
- **Custom Expense Profiles** — Per-user expense assumptions by property type, persisted across sessions, so the deal analyzer reflects how *this* investor actually underwrites rather than generic defaults.
