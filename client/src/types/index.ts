export interface MacroData {
  sp500: { price: number; change: number; changePercent: number }
  treasury10Y: number
  treasury10YChange: number
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

export interface HistoryResponse {
  seriesId: string
  label: string
  range: string
  data: { date: string; value: number }[]
}

export interface DealInputs {
  units: number
  purchasePrice: number
  avgRentPerUnit: number
  location: string
  downPaymentPercent: number
  loanTermYears: number
  interestRateOverride: number | null
}

export interface DealResults {
  grossPotentialRent: number
  effectiveGrossIncome: number
  totalOperatingExpenses: number
  noi: number
  capRate: number
  monthlyPayment: number
  annualDebtService: number
  annualCashFlow: number
  monthlyCashFlow: number
  cashInvested: number
  cashOnCash: number
  expenseRatio: number
  dealQuality: 'Tight' | 'Decent' | 'Strong'
  flags: string[]
}

export interface AreaLookup {
  geo: { state: string; stateAbbr: string; county: string; zip: string; lat: number; lng: number }
  fmr: { studio: number; oneBr: number; twoBr: number; threeBr: number; fourBr: number } | null
  census: { medianIncome: number | null; medianRent: number | null; population: number | null } | null
}

export interface SFRInputs {
  beds: number
  baths: number
  monthlyRent: number | null
  purchasePrice: number
  location: string
  downPaymentPercent: number
  loanTermYears: number
  interestRateOverride: number | null
}

export interface SFRResults {
  grossAnnualRent: number
  effectiveGrossIncome: number
  totalOperatingExpenses: number
  noi: number
  capRate: number
  monthlyPayment: number
  annualDebtService: number
  annualCashFlow: number
  monthlyCashFlow: number
  cashInvested: number
  cashOnCash: number
  expenseRatio: number
  dealQuality: 'Negative Cash Flow' | 'Thin Margin' | 'Healthy Cash Flow'
  flags: string[]
  rentSource: 'manual' | 'fmr' | 'none'
}

export type DealTab = 'multifamily' | 'sfr'

export interface SavedDeal {
  id: string
  address: string
  type: DealTab
  inputs: DealInputs | SFRInputs
  results: DealResults | SFRResults
  areaData: AreaLookup | null
  savedAt: number
}

export interface RealtimeQuote {
  symbol: string
  price: number
  timestamp: number
}
