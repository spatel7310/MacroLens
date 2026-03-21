import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env') })

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  finnhubApiKey: process.env.FINNHUB_API_KEY || '',
  fredApiKey: process.env.FRED_API_KEY || '',
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
  hudUserToken: process.env.HUD_USER_TOKEN || '',
  censusApiKey: process.env.CENSUS_API_KEY || '',
  cacheTTL: {
    quotes: 30,
    fred: 6 * 60 * 60,
    news: 15 * 60,
    calendar: 60 * 60,
  },
}
