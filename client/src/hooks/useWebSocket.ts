import { useEffect, useRef } from 'react'
import { useRealtimeStore } from '@/stores/realtimeStore'

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const setQuote = useRealtimeStore((s) => s.setQuote)
  const setConnected = useRealtimeStore((s) => s.setConnected)

  useEffect(() => {
    let attempt = 0
    let disposed = false

    function connect() {
      if (disposed) return
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        attempt = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.symbol && data.price) {
            setQuote({
              symbol: data.symbol,
              price: data.price,
              timestamp: data.timestamp || Date.now(),
            })
          }
        } catch {}
      }

      ws.onclose = () => {
        setConnected(false)
        if (!disposed) {
          const delay = Math.min(1000 * 2 ** attempt, 30_000)
          attempt++
          reconnectTimeout.current = setTimeout(connect, delay)
        }
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      disposed = true
      clearTimeout(reconnectTimeout.current)
      wsRef.current?.close()
    }
  }, [setQuote, setConnected])
}
