import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as fred from '../services/fred.js'

const router = Router()

// 2026 FOMC meeting dates
const FOMC_DATES = [
  '2026-01-28', '2026-03-18', '2026-05-06', '2026-06-17',
  '2026-07-29', '2026-09-16', '2026-11-04', '2026-12-16',
]

function getNextMeeting(): { date: string; countdown: string } {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const next = FOMC_DATES.find((d) => d >= todayStr) || FOMC_DATES[0]
  const diffMs = new Date(next).getTime() - now.getTime()
  const days = Math.max(0, Math.ceil(diffMs / 86_400_000))
  return {
    date: next,
    countdown: days === 0 ? 'Today' : `${days}d`,
  }
}

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('fed', config.cacheTTL.fred, async () => {
      const [currentRate, prevRates] = await Promise.all([
        fred.getFedFundsRate(),
        fred.getSeriesValues('DFEDTARU', 2),
      ])

      const meeting = getNextMeeting()

      let lastDecision: 'hike' | 'cut' | 'hold' = 'hold'
      if (prevRates.length >= 2) {
        const diff = prevRates[prevRates.length - 1].value - prevRates[prevRates.length - 2].value
        if (diff > 0) lastDecision = 'hike'
        else if (diff < 0) lastDecision = 'cut'
      }

      const stance = lastDecision === 'cut' ? 'Dovish' : lastDecision === 'hike' ? 'Hawkish' : 'Neutral'

      return {
        nextMeeting: meeting.date,
        countdown: meeting.countdown,
        currentRate,
        lastDecision,
        stance,
      }
    })
    res.json(data)
  } catch (error) {
    console.error('Fed route error:', error)
    res.status(500).json({ error: 'Failed to fetch fed data' })
  }
})

export default router
