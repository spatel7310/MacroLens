# MacroLens V2 Roadmap

Feature ideas and priorities discussed after shipping v1 (Labor Market + Yield Curve components).

---

## High Impact Features

### Watchlist
Save specific stocks, ETFs, and REITs for at-a-glance quotes. Natural extension of the existing Finnhub integration.

### Deal Comparisons
Side-by-side comparison view for 2-3 saved deals. Builds on the saved deals already stored in localStorage. Great for the "paper napkin at a showing" workflow.

### Mortgage Calculator
Quick monthly payment calculator with the live 30Y rate auto-filled. Simpler than the full deal analyzer — for when someone just wants to sanity-check affordability on the spot.

### Snapshot Sharing
Export a deal analysis or market snapshot as an image/PDF to text a partner or investor. Key for the "found a deal, need to share fast" use case.

### Recession Probability Score
Composite 0-100 score combining yield curve, unemployment trend, consumer sentiment, and VIX. All data is already flowing through the app — just needs a scoring algorithm and UI.

---

## Polish Features

### True OLED Dark Mode
Current void background is close, but a pure `#000` OLED mode saves battery on mobile AMOLED screens.

### Offline Caching
PWA plugin is already installed. Cache the last-fetched data so the app is useful on a plane or in a dead zone.

### Historical Event Markers
On 5Y/15Y charts, overlay markers for major events (rate cuts, COVID crash, SVB collapse, etc.) to give context to the data.

---

## Push Notifications

### Web Push (Recommended First)
- Already have `vite-plugin-pwa` installed — 80% of the way there
- Add a service worker push handler + `web-push` npm package on the server
- User grants notification permission, subscription stored on server, existing alert rules trigger push notifications
- Works on **Android Chrome** and **iOS Safari 16.4+** — no app store needed
- **Effort: ~1-2 days**

### Native Push (Later)
- Wrap PWA in Capacitor or Expo for native iOS/Android push via APNs/FCM
- Requires app store accounts ($99/yr Apple, $25 one-time Google)
- Only worth it for native features (haptics, widgets, background refresh)
- **Effort: ~1-2 weeks**

---

## V3 / Ambitious

### AI Deal Summary
Feed deal analyzer outputs + local market data into an LLM for a plain-English analysis paragraph.

### Portfolio Stress Test
"What happens to my deals if rates hit 8%?" — using live data as baseline for scenario modeling.

### Multi-Property Dashboard
For users who graduate from paper napkin analysis to managing a small portfolio of properties.
