---
name: V2 Roadmap Ideas
description: Feature ideas and push notification strategy discussed for MacroLens v2 after completing v1 with Labor Market and Yield Curve components
type: project
---

V2 feature ideas discussed 2026-03-30 after shipping Labor Market + Yield Curve components.

**High Impact Features:**
- Watchlist (stocks/ETFs/REITs) — extends existing Finnhub integration
- Deal Comparisons — side-by-side saved deals (already in Zustand/localStorage)
- Mortgage Calculator — quick calc with live 30Y rate auto-filled
- Snapshot Sharing — export deal analysis or market snapshot as image/PDF
- Recession Probability Score — composite 0-100 from yield curve, unemployment, sentiment, VIX (all data already flowing)

**Polish Features:**
- True OLED dark mode (#000)
- Offline caching via existing PWA plugin
- Historical event markers on 5Y/15Y charts (rate cuts, COVID, etc.)

**V3 Ambitious:**
- AI Deal Summary (LLM analysis of deal + local market data)
- Portfolio Stress Test ("what if rates hit 8%?")
- Multi-property Dashboard

**Push Notifications Strategy:**
- Web Push recommended first — already have vite-plugin-pwa, just need service worker push handler + `web-push` npm package on server. Works iOS Safari 16.4+ and Android Chrome. ~1-2 days effort.
- Native (Capacitor/Expo) only if app store distribution or native features needed later. ~1-2 weeks.

**Why:** User wants a pocket investing + paper napkin deal analysis tool. Features should prioritize speed-to-insight on mobile and shareability.

**How to apply:** When building v2 features, leverage existing data pipelines (FRED, Finnhub, alert rules) rather than adding new external dependencies. Web Push should be first infra investment since alerts already exist.
