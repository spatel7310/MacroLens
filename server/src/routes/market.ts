import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as finnhub from '../services/finnhub.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('market', config.cacheTTL.quotes, async () => {
      // Use UVXY as VIX proxy since VIX itself isn't directly quotable on Finnhub free tier
      // Alternatively use ^VIX or VIXY
      const vixQuote = await finnhub.getQuote('VIXY')
      const vix = vixQuote.price

      let trend: 'Risk-On' | 'Caution' | 'Risk-Off'
      if (vix < 16) trend = 'Risk-On'
      else if (vix < 25) trend = 'Caution'
      else trend = 'Risk-Off'

      return {
        vix,
        vixChange: vixQuote.changePercent,
        trend,
      }
    })
    res.json(data)
  } catch (error) {
    console.error('Market route error:', error)
    res.status(500).json({ error: 'Failed to fetch market data' })
  }
})

export default router
