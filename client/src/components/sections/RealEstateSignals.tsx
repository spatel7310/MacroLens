import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { TrendArrow } from '../ui/TrendArrow'
import { Skeleton } from '../ui/Skeleton'
import { useRealEstateData } from '@/hooks/useMarketData'
import { formatRate, formatPercent } from '@/lib/formatters'

export function RealEstateSignals() {
  const { data, isLoading } = useRealEstateData()

  if (isLoading) {
    return (
      <SectionCard title="Real Estate Signals" accent="magenta">
        <div className="space-y-3">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </SectionCard>
    )
  }

  if (!data) return null

  return (
    <SectionCard title="Real Estate Signals" accent="magenta">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-chrome/50 uppercase tracking-wider">30Y Mortgage</div>
            <div className="flex items-center gap-2">
              <NumberTicker value={data.mortgageRate} format={(n) => formatRate(n)} className="text-sm font-bold text-chrome" />
              <TrendArrow direction={data.mortgageTrend} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-chrome/50 uppercase tracking-wider">Home Price Index</div>
            <div className="flex items-center gap-2">
              <NumberTicker value={data.homePriceIndex} format={(n) => n.toFixed(1)} className="text-sm font-bold text-chrome" />
              <span className={`text-xs ${data.homePriceYoY >= 0 ? 'text-green' : 'text-magenta'}`}>
                {formatPercent(data.homePriceYoY)} YoY
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-chrome/50 uppercase tracking-wider">Rent CPI</div>
            <span className={`text-sm font-bold ${data.rentTrendYoY >= 0 ? 'text-magenta' : 'text-green'}`}>
              {formatPercent(data.rentTrendYoY)} YoY
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
