import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'

const router = Router()

const ALLOWED_SERIES: Record<string, string> = {
  DGS10: '10Y Treasury Yield',
  MORTGAGE30US: '30Y Mortgage Rate',
  CPIAUCSL: 'CPI',
  DFEDTARU: 'Fed Funds Upper',
  UNRATE: 'Unemployment Rate',
  ICSA: 'Initial Jobless Claims',
  DGS2: '2Y Treasury Yield',
  T10Y2Y: '10Y-2Y Yield Spread',
  UMCSENT: 'Consumer Sentiment',
}

const RANGE_LIMITS: Record<string, number> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '5Y': 1825,
  '15Y': 5475,
}

router.get('/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params
    const range = (req.query.range as string) || '3M'

    if (!ALLOWED_SERIES[seriesId]) {
      res.status(400).json({ error: 'Invalid series' })
      return
    }

    const days = RANGE_LIMITS[range] || 90
    const cacheKey = `history:${seriesId}:${range}`

    const data = await withCache(cacheKey, config.cacheTTL.fred, async () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)

      const url = new URL('https://api.stlouisfed.org/fred/series/observations')
      url.searchParams.set('series_id', seriesId)
      url.searchParams.set('api_key', config.fredApiKey)
      url.searchParams.set('file_type', 'json')
      url.searchParams.set('observation_start', start.toISOString().split('T')[0])
      url.searchParams.set('observation_end', end.toISOString().split('T')[0])
      url.searchParams.set('sort_order', 'asc')

      const resp = await fetch(url.toString())
      if (!resp.ok) throw new Error(`FRED error: ${resp.status}`)
      const json = (await resp.json()) as { observations: { date: string; value: string }[] }

      return json.observations
        .filter((o) => o.value !== '.')
        .map((o) => ({ date: o.date, value: parseFloat(o.value) }))
    })

    res.json({ seriesId, label: ALLOWED_SERIES[seriesId], range, data })
  } catch (error) {
    console.error('History route error:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

export default router
