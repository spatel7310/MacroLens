import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as fred from '../services/fred.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('market', config.cacheTTL.fred, async () => {
      const vixValues = await fred.getSeriesValues('VIXCLS', 5)
      if (vixValues.length < 2) throw new Error('Not enough VIX data')
      const vix = vixValues[vixValues.length - 1].value
      const prevVix = vixValues[vixValues.length - 2].value
      const vixChange = prevVix !== 0 ? ((vix - prevVix) / prevVix) * 100 : 0

      let trend: 'Risk-On' | 'Caution' | 'Risk-Off'
      if (vix < 16) trend = 'Risk-On'
      else if (vix < 25) trend = 'Caution'
      else trend = 'Risk-Off'

      return {
        vix,
        vixChange: Math.round(vixChange * 100) / 100,
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
