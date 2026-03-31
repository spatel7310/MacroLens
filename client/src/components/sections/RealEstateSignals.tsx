import { useState } from 'react'
import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { TrendArrow } from '../ui/TrendArrow'
import { Skeleton } from '../ui/Skeleton'
import { ChartModal } from '../ui/ChartModal'
import { CollapsibleDescription } from '../ui/CollapsibleDescription'
import { useRealEstateData } from '@/hooks/useMarketData'
import { useDescriptionToggle } from '@/hooks/useDescriptionToggle'
import { formatRate, formatPercent } from '@/lib/formatters'

export function RealEstateSignals() {
  const { data, isLoading } = useRealEstateData()
  const [showChart, setShowChart] = useState(false)
  const [descVisible, toggleDesc] = useDescriptionToggle('real-estate')

  if (isLoading) {
    return (
      <SectionCard title="Real Estate Signals" accent="green">
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
    <>
      <SectionCard title="Real Estate Signals" accent="green" onClick={toggleDesc}>
        <div className="space-y-3">
          <div
            className="w-fit active:bg-magenta/5 rounded-md -m-1.5 p-1.5 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setShowChart(true) }}
          >
            <div className="text-[10px] text-chrome/50 uppercase tracking-wider">
              30Y Mortgage
              <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <NumberTicker value={data.mortgageRate} format={(n) => formatRate(n)} className="text-sm font-bold text-chrome" />
              <TrendArrow direction={data.mortgageTrend} />
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
        <CollapsibleDescription visible={descVisible}>
          <p className="text-[10px] text-chrome/35 leading-relaxed mt-2">
            Mortgage rates follow the 10Y Treasury. Rising rates reduce buying power and cool home prices, while falling rates fuel demand. Rent CPI shows how shelter costs are driving inflation.
          </p>
        </CollapsibleDescription>
      </SectionCard>

      {showChart && (
        <ChartModal
          seriesId="MORTGAGE30US"
          label="30Y Mortgage Rate"
          color="#ff2a6d"
          onClose={() => setShowChart(false)}
        />
      )}
    </>
  )
}
