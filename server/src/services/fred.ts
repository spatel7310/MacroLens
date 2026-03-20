import { config } from '../config.js'

const BASE = 'https://api.stlouisfed.org/fred/series/observations'

interface FredObservation {
  date: string
  value: string
}

interface FredResponse {
  observations: FredObservation[]
}

async function getLatestObservation(seriesId: string, limit = 1): Promise<FredObservation[]> {
  const url = new URL(BASE)
  url.searchParams.set('series_id', seriesId)
  url.searchParams.set('api_key', config.fredApiKey)
  url.searchParams.set('file_type', 'json')
  url.searchParams.set('sort_order', 'desc')
  url.searchParams.set('limit', String(limit))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`FRED error for ${seriesId}: ${res.status}`)
  const data = (await res.json()) as FredResponse
  return data.observations.filter((o) => o.value !== '.')
}

export async function getSeriesValue(seriesId: string): Promise<number> {
  const obs = await getLatestObservation(seriesId, 1)
  if (!obs.length) throw new Error(`No data for ${seriesId}`)
  return parseFloat(obs[0].value)
}

export async function getSeriesValues(seriesId: string, count: number): Promise<{ date: string; value: number }[]> {
  const obs = await getLatestObservation(seriesId, count)
  return obs.map((o) => ({ date: o.date, value: parseFloat(o.value) })).reverse()
}

export async function getTreasury10Y(): Promise<number> {
  return getSeriesValue('DGS10')
}

export async function getMortgageRate(): Promise<number> {
  return getSeriesValue('MORTGAGE30US')
}

export async function getFedFundsRate(): Promise<{ upper: number; lower: number }> {
  const [upper, lower] = await Promise.all([
    getSeriesValue('DFEDTARU'),
    getSeriesValue('DFEDTARL'),
  ])
  return { upper, lower }
}

export async function getCPIYoY(): Promise<number> {
  // Request extra to account for filtered '.' values
  const values = await getSeriesValues('CPIAUCSL', 24)
  if (values.length < 2) throw new Error('Not enough CPI data')
  const latest = values[values.length - 1].value
  // Find value closest to 12 months ago
  const yearAgo = values.length >= 13 ? values[values.length - 13].value : values[0].value
  return ((latest - yearAgo) / yearAgo) * 100
}

export async function getHomePriceIndex(): Promise<{ value: number; yoy: number }> {
  const values = await getSeriesValues('CSUSHPISA', 24)
  if (values.length < 2) throw new Error('Not enough home price data')
  const latest = values[values.length - 1].value
  const yearAgo = values.length >= 13 ? values[values.length - 13].value : values[0].value
  return {
    value: latest,
    yoy: ((latest - yearAgo) / yearAgo) * 100,
  }
}

export async function getRentTrendYoY(): Promise<number> {
  const values = await getSeriesValues('CUSR0000SEHA', 24)
  if (values.length < 2) throw new Error('Not enough rent data')
  const latest = values[values.length - 1].value
  const yearAgo = values.length >= 13 ? values[values.length - 13].value : values[0].value
  return ((latest - yearAgo) / yearAgo) * 100
}

export async function getMortgageTrend(): Promise<'up' | 'down' | 'flat'> {
  const values = await getSeriesValues('MORTGAGE30US', 5)
  if (values.length < 2) return 'flat'
  const latest = values[values.length - 1].value
  const prev = values[0].value
  const diff = latest - prev
  if (Math.abs(diff) < 0.05) return 'flat'
  return diff > 0 ? 'up' : 'down'
}
