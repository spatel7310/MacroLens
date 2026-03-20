import type { MacroData, FedData, MarketData, RealEstateData, CalendarEvent, NewsItem } from '@/types'

const BASE = import.meta.env.VITE_SERVER_URL
  ? `${import.meta.env.VITE_SERVER_URL}/api`
  : '/api'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  macro: () => fetchJson<MacroData>('/macro'),
  fed: () => fetchJson<FedData>('/fed'),
  market: () => fetchJson<MarketData>('/market'),
  realEstate: () => fetchJson<RealEstateData>('/real-estate'),
  calendar: () => fetchJson<CalendarEvent[]>('/calendar'),
  news: () => fetchJson<NewsItem[]>('/news'),
}
