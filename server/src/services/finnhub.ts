import { config } from '../config.js'

const BASE = 'https://finnhub.io/api/v1'

async function finnhubGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('token', config.finnhubApiKey)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  return res.json() as Promise<T>
}

interface FinnhubQuote {
  c: number  // current
  d: number  // change
  dp: number // percent change
  h: number  // high
  l: number  // low
  o: number  // open
  pc: number // previous close
}

export async function getQuote(symbol: string) {
  const q = await finnhubGet<FinnhubQuote>('/quote', { symbol })
  return {
    price: q.c,
    change: q.d,
    changePercent: q.dp,
  }
}

interface FinnhubNews {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export async function getMarketNews(keywords: string[]) {
  const news = await finnhubGet<FinnhubNews[]>('/news', { category: 'general' })
  const keywordsLower = keywords.map((k) => k.toLowerCase())
  const filtered = news.filter((item) => {
    const text = `${item.headline} ${item.summary}`.toLowerCase()
    return keywordsLower.some((kw) => text.includes(kw))
  })
  return filtered.slice(0, 15).map((item) => ({
    title: item.headline,
    url: item.url,
    source: item.source,
    time: new Date(item.datetime * 1000).toISOString(),
    relativeTime: formatRelativeTime(item.datetime * 1000),
  }))
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

interface FinnhubCalendarEvent {
  country: string
  date: string
  event: string
  impact: string
  prev: string
  estimate: string
}

interface FinnhubCalendarResponse {
  economicCalendar: FinnhubCalendarEvent[]
}

export async function getEconomicCalendar() {
  const now = new Date()
  const from = now.toISOString().slice(0, 10)
  const to = new Date(now.getTime() + 30 * 86_400_000).toISOString().slice(0, 10)
  const data = await finnhubGet<FinnhubCalendarResponse>('/calendar/economic', { from, to })
  const events = data.economicCalendar || []
  const highImpact = events.filter(
    (e) =>
      e.impact === 'high' ||
      /cpi|nfp|fomc|gdp|payroll|fed/i.test(e.event)
  )
  return highImpact.slice(0, 10).map((e) => ({
    date: e.date,
    name: e.event,
    impact: (e.impact || 'medium') as 'high' | 'medium' | 'low',
    previous: e.prev || '',
    forecast: e.estimate || '',
  }))
}
