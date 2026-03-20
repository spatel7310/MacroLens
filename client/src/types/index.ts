export interface MacroData {
  sp500: { price: number; change: number; changePercent: number }
  treasury10Y: number
  mortgageRate: number
  fedRate: { upper: number; lower: number }
  cpiYoY: number
}

export interface FedData {
  nextMeeting: string
  countdown: string
  currentRate: { upper: number; lower: number }
  lastDecision: 'hike' | 'cut' | 'hold'
  stance: 'Dovish' | 'Hawkish' | 'Neutral'
}

export interface MarketData {
  vix: number
  vixChange: number
  trend: 'Risk-On' | 'Caution' | 'Risk-Off'
}

export interface RealEstateData {
  mortgageRate: number
  mortgageTrend: 'up' | 'down' | 'flat'
  homePriceIndex: number
  homePriceYoY: number
  rentTrendYoY: number
}

export interface CalendarEvent {
  date: string
  name: string
  impact: 'high' | 'medium' | 'low'
  previous: string
  forecast: string
}

export interface NewsItem {
  title: string
  url: string
  source: string
  time: string
  relativeTime: string
}

export interface AlertRule {
  id: string
  label: string
  metric: string
  operator: '>' | '<' | '>=' | '<='
  threshold: number
  enabled: boolean
  cooldownMinutes: number
  lastTriggered?: number
}

export interface TriggeredAlert {
  id: string
  ruleId: string
  message: string
  timestamp: number
  dismissed: boolean
}

export interface RealtimeQuote {
  symbol: string
  price: number
  timestamp: number
}
