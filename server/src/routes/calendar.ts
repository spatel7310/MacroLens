import { Router } from 'express'

const router = Router()

// Major US economic events for 2026 (publicly known schedule)
const ECONOMIC_EVENTS = [
  // FOMC meetings
  { date: '2026-01-28', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-03-18', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-05-06', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-06-17', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-07-29', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-09-16', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-11-04', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-12-16', name: 'FOMC Rate Decision', impact: 'high' as const, previous: '', forecast: '' },
  // CPI releases (typically ~13th of each month)
  { date: '2026-01-14', name: 'CPI (Dec)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-02-11', name: 'CPI (Jan)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-03-11', name: 'CPI (Feb)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-04-14', name: 'CPI (Mar)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-05-13', name: 'CPI (Apr)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-06-10', name: 'CPI (May)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-07-15', name: 'CPI (Jun)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-08-12', name: 'CPI (Jul)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-09-11', name: 'CPI (Aug)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-10-14', name: 'CPI (Sep)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-11-12', name: 'CPI (Oct)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-12-10', name: 'CPI (Nov)', impact: 'high' as const, previous: '', forecast: '' },
  // NFP (first Friday of each month)
  { date: '2026-01-09', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-02-06', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-03-06', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-04-03', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-05-08', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-06-05', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-07-02', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-08-07', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-09-04', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-10-02', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-11-06', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-12-04', name: 'Non-Farm Payrolls', impact: 'high' as const, previous: '', forecast: '' },
  // GDP (advance estimates, ~end of month after quarter)
  { date: '2026-01-29', name: 'GDP (Q4 Advance)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-04-29', name: 'GDP (Q1 Advance)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-07-30', name: 'GDP (Q2 Advance)', impact: 'high' as const, previous: '', forecast: '' },
  { date: '2026-10-29', name: 'GDP (Q3 Advance)', impact: 'high' as const, previous: '', forecast: '' },
]

router.get('/', (_req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = ECONOMIC_EVENTS
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10)
  res.json(upcoming)
})

export default router
