import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { config } from './config.js'
import { setupWebSocket } from './websocket/finnhubProxy.js'
import macroRouter from './routes/macro.js'
import fedRouter from './routes/fed.js'
import marketRouter from './routes/market.js'
import realEstateRouter from './routes/realEstate.js'
import calendarRouter from './routes/calendar.js'
import newsRouter from './routes/news.js'
import historyRouter from './routes/history.js'
import dealRouter from './routes/deal.js'
import laborRouter from './routes/labor.js'
import yieldCurveRouter from './routes/yieldCurve.js'

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/macro', macroRouter)
app.use('/api/fed', fedRouter)
app.use('/api/market', marketRouter)
app.use('/api/real-estate', realEstateRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/news', newsRouter)
app.use('/api/history', historyRouter)
app.use('/api/deal', dealRouter)
app.use('/api/labor', laborRouter)
app.use('/api/yield-curve', yieldCurveRouter)

const server = createServer(app)
setupWebSocket(server)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
