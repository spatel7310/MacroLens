import { Router } from 'express'
import { withCache } from '../services/cache.js'
import { config } from '../config.js'

const router = Router()

interface GeoResult {
  state: string
  stateAbbr: string
  county: string
  zip: string
  lat: number
  lng: number
}

interface AreaData {
  geo: GeoResult
  fmr: { studio: number; oneBr: number; twoBr: number; threeBr: number; fourBr: number } | null
  census: { medianIncome: number | null; medianRent: number | null; population: number | null } | null
}

// State FIPS → abbreviation
const FIPS_TO_ABBR: Record<string, string> = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE',
  '11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA',
  '20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN',
  '28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM',
  '36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI',
  '45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA',
  '54':'WV','55':'WI','56':'WY',
}

async function geocodeAddress(address: string): Promise<GeoResult | null> {
  const url = new URL('https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress')
  url.searchParams.set('address', address)
  url.searchParams.set('benchmark', 'Public_AR_Current')
  url.searchParams.set('vintage', 'Current_Current')
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString())
  if (!res.ok) return null
  const data = await res.json()

  const match = data?.result?.addressMatches?.[0]
  if (!match) return null

  const geo = match.geographies?.['Census Tracts']?.[0]
  const stateFips = geo?.STATE || ''
  const countyName = geo?.COUNTY || ''
  const zip = match.addressComponents?.zip || ''

  return {
    state: geo?.STATE || '',
    stateAbbr: FIPS_TO_ABBR[stateFips] || '',
    county: countyName,
    zip,
    lat: parseFloat(match.coordinates?.y || '0'),
    lng: parseFloat(match.coordinates?.x || '0'),
  }
}

async function fetchFMR(stateAbbr: string, zip: string) {
  if (!config.hudUserToken) return null
  try {
    // Try zip-level Small Area FMR first
    const url = `https://www.huduser.gov/hudapi/public/fmr/data/${zip}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${config.hudUserToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()

    // ZIP-level response structure
    const d = data?.data?.basicdata
    if (d) {
      return {
        studio: d.Efficiency || d.efficiency || 0,
        oneBr: d['One-Bedroom'] || d.one_bedroom || 0,
        twoBr: d['Two-Bedroom'] || d.two_bedroom || 0,
        threeBr: d['Three-Bedroom'] || d.three_bedroom || 0,
        fourBr: d['Four-Bedroom'] || d.four_bedroom || 0,
      }
    }

    // Fallback: county-level fields
    const county = data?.data?.metroarea || data?.data?.county
    if (county) {
      return {
        studio: county.Efficiency || county.efficiency || 0,
        oneBr: county['One-Bedroom'] || county.one_bedroom || 0,
        twoBr: county['Two-Bedroom'] || county.two_bedroom || 0,
        threeBr: county['Three-Bedroom'] || county.three_bedroom || 0,
        fourBr: county['Four-Bedroom'] || county.four_bedroom || 0,
      }
    }

    return null
  } catch {
    return null
  }
}

async function fetchCensus(stateFips: string, zip: string) {
  try {
    const key = config.censusApiKey ? `&key=${config.censusApiKey}` : ''
    // B25064_001E = Median Gross Rent, B19013_001E = Median Household Income, B01003_001E = Population
    const url = `https://api.census.gov/data/2023/acs/acs5?get=B25064_001E,B19013_001E,B01003_001E&for=zip%20code%20tabulation%20area:${zip}${key}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()

    if (!data || data.length < 2) return null
    const row = data[1]
    return {
      medianRent: row[0] && row[0] !== '-666666666' ? parseInt(row[0]) : null,
      medianIncome: row[1] && row[1] !== '-666666666' ? parseInt(row[1]) : null,
      population: row[2] && row[2] !== '-666666666' ? parseInt(row[2]) : null,
    }
  } catch {
    return null
  }
}

router.get('/lookup', async (req, res) => {
  try {
    const address = req.query.address as string
    if (!address || address.length < 5) {
      res.status(400).json({ error: 'Address required' })
      return
    }

    const cacheKey = `deal-lookup:${address.toLowerCase().trim()}`
    const data = await withCache<AreaData>(cacheKey, 24 * 60 * 60, async () => {
      const geo = await geocodeAddress(address)
      if (!geo) throw new Error('Address not found')

      const [fmr, census] = await Promise.all([
        fetchFMR(geo.stateAbbr, geo.zip),
        fetchCensus(geo.state, geo.zip),
      ])

      return { geo, fmr, census }
    })

    res.json(data)
  } catch (error: any) {
    if (error?.message === 'Address not found') {
      res.status(404).json({ error: 'Address not found' })
      return
    }
    console.error('Deal lookup error:', error)
    res.status(500).json({ error: 'Lookup failed' })
  }
})

export default router
