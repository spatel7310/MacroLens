import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as fred from '../services/fred.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('real-estate', config.cacheTTL.fred, async () => {
      const [mortgageRate, mortgageTrend, homePrice, rentTrendYoY] = await Promise.all([
        fred.getMortgageRate(),
        fred.getMortgageTrend(),
        fred.getHomePriceIndex(),
        fred.getRentTrendYoY(),
      ])
      return {
        mortgageRate,
        mortgageTrend,
        homePriceIndex: homePrice.value,
        homePriceYoY: Math.round(homePrice.yoy * 100) / 100,
        rentTrendYoY: Math.round(rentTrendYoY * 100) / 100,
      }
    })
    res.json(data)
  } catch (error) {
    console.error('Real estate route error:', error)
    res.status(500).json({ error: 'Failed to fetch real estate data' })
  }
})

export default router
