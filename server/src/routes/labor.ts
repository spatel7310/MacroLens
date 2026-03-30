import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as fred from '../services/fred.js'

const router = Router()

function computeSignal(
  unemploymentTrend: string,
  claimsTrend: string
): 'Strong' | 'Stable' | 'Weakening' {
  if (unemploymentTrend === 'Falling') return 'Strong'
  if (unemploymentTrend === 'Rising' && claimsTrend === 'Increasing') return 'Weakening'
  return 'Stable'
}

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('labor', config.cacheTTL.fred, async () => {
      const [unemployment, claims] = await Promise.all([
        fred.getUnemploymentRate(),
        fred.getJoblessClaims(),
      ])

      return {
        unemployment,
        claims,
        signal: computeSignal(unemployment.trend, claims.trend),
      }
    })
    res.json(data)
  } catch (error) {
    console.error('Labor route error:', error)
    res.status(500).json({ error: 'Failed to fetch labor data' })
  }
})

export default router
