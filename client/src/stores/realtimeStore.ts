import { create } from 'zustand'
import type { RealtimeQuote } from '@/types'

interface RealtimeState {
  quotes: Record<string, RealtimeQuote>
  connected: boolean
  setQuote: (quote: RealtimeQuote) => void
  setConnected: (connected: boolean) => void
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  quotes: {},
  connected: false,
  setQuote: (quote) =>
    set((state) => ({
      quotes: { ...state.quotes, [quote.symbol]: quote },
    })),
  setConnected: (connected) => set({ connected }),
}))
