import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'
import * as finnhub from '../services/finnhub.js'

const router = Router()

const NEWS_KEYWORDS = ['fed', 'inflation', 'housing', 'mortgage', 'interest rate', 'treasury', 'recession', 'employment']

router.get('/', async (_req, res) => {
  try {
    const data = await withCache('news', config.cacheTTL.news, async () => {
      return finnhub.getMarketNews(NEWS_KEYWORDS)
    })
    res.json(data)
  } catch (error) {
    console.error('News route error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})

export default router
