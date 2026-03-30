import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as fred from '../services/fred.js'

const router = Router()

type CurveStatus = 'Normal' | 'Flattening' | 'Inverted'
type RecessionSignal = 'Normal' | 'Inversion (Warning)' | 'Recession Risk Rising'

function computeCurveStatus(spread: number): CurveStatus {
  if (spread < 0) return 'Inverted'
  if (spread <= 0.5) return 'Flattening'
  return 'Normal'
}

function computeRecessionSignal(
  currentSpread: number,
  history: { date: string; value: number }[]
): RecessionSignal {
  const wasInverted = history.some((d) => d.value < 0)

  if (currentSpread < 0) return 'Inversion (Warning)'
  if (wasInverted && currentSpread > 0) return 'Recession Risk Rising'
  return 'Normal'
}

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('yield-curve', config.cacheTTL.fred, async () => {
      const [treasury10Y, treasury2Y, curveHistory, sentiment] = await Promise.all([
        fred.getSeriesValue('DGS10'),
        fred.getTreasury2Y(),
        fred.getYieldCurveHistory(),
        fred.getConsumerSentiment(),
      ])

      const spread = Math.round((treasury10Y - treasury2Y) * 100) / 100

      return {
        treasury10Y,
        treasury2Y,
        spread,
        curveStatus: computeCurveStatus(spread),
        recessionSignal: computeRecessionSignal(spread, curveHistory),
        sentiment,
      }
    })
    res.json(data)
  } catch (error) {
    console.error('Yield curve route error:', error)
    res.status(500).json({ error: 'Failed to fetch yield curve data' })
  }
})

export default router
