import WebSocket, { WebSocketServer } from 'ws'
import type { Server } from 'http'
import { config } from '../config.js'

const SYMBOLS = ['SPY', 'VIXY']

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' })
  let finnhubWs: WebSocket | null = null
  let reconnectAttempt = 0

  function connectFinnhub() {
    if (!config.finnhubApiKey) {
      console.log('No Finnhub API key — WebSocket disabled')
      return
    }

    finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${config.finnhubApiKey}`)

    finnhubWs.on('open', () => {
      console.log('Connected to Finnhub WebSocket')
      reconnectAttempt = 0
      for (const symbol of SYMBOLS) {
        finnhubWs!.send(JSON.stringify({ type: 'subscribe', symbol }))
      }
    })

    finnhubWs.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg.type === 'trade' && msg.data?.length) {
          for (const trade of msg.data) {
            const payload = JSON.stringify({
              symbol: trade.s,
              price: trade.p,
              timestamp: trade.t,
            })
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(payload)
              }
            })
          }
        }
      } catch {}
    })

    finnhubWs.on('close', () => {
      console.log('Finnhub WebSocket closed, reconnecting...')
      const delay = Math.min(1000 * 2 ** reconnectAttempt, 30_000)
      reconnectAttempt++
      setTimeout(connectFinnhub, delay)
    })

    finnhubWs.on('error', (err) => {
      console.error('Finnhub WebSocket error:', err.message)
      finnhubWs?.close()
    })
  }

  connectFinnhub()

  wss.on('connection', (ws) => {
    console.log('Client connected to WS')
    ws.on('close', () => console.log('Client disconnected from WS'))
  })

  return wss
}
