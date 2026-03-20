import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as finnhub from '../services/finnhub.js'
import * as fred from '../services/fred.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('macro', config.cacheTTL.quotes, async () => {
      const [spy, treasury10Y, mortgageRate, fedRate, cpiYoY] = await Promise.all([
        finnhub.getQuote('SPY'),
        fred.getTreasury10Y(),
        fred.getMortgageRate(),
        fred.getFedFundsRate(),
        fred.getCPIYoY(),
      ])
      return {
        sp500: spy,
        treasury10Y,
        mortgageRate,
        fedRate,
        cpiYoY: Math.round(cpiYoY * 100) / 100,
      }
    })
    res.json(data)
  } catch (error) {
    console.error('Macro route error:', error)
    res.status(500).json({ error: 'Failed to fetch macro data' })
  }
})

export default router
