export const REFETCH_INTERVALS = {
  macro: 60_000,
  fed: 6 * 60 * 60_000,
  market: 2 * 60_000,
  realEstate: 12 * 60 * 60_000,
  calendar: 2 * 60 * 60_000,
  news: 15 * 60_000,
} as const

export const VIX_THRESHOLDS = {
  riskOn: 16,
  caution: 25,
} as const

export const DEFAULT_ALERT_RULES = [
  {
    id: 'mortgage-below-6',
    label: 'Mortgage rate below 6%',
    metric: 'mortgageRate',
    operator: '<' as const,
    threshold: 6,
    enabled: true,
    cooldownMinutes: 1440,
  },
  {
    id: 'sp500-drop-2pct',
    label: 'S&P 500 drops > 2%',
    metric: 'sp500ChangePercent',
    operator: '<' as const,
    threshold: -2,
    enabled: true,
    cooldownMinutes: 60,
  },
  {
    id: 'vix-above-30',
    label: 'VIX above 30',
    metric: 'vix',
    operator: '>' as const,
    threshold: 30,
    enabled: true,
    cooldownMinutes: 60,
  },
  {
    id: 'fed-rate-decrease',
    label: 'Fed rate decrease',
    metric: 'fedRateChange',
    operator: '<' as const,
    threshold: 0,
    enabled: true,
    cooldownMinutes: 1440,
  },
]
